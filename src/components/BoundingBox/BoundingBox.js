import React, { useRef, useEffect, useState } from 'react';
import styles from "./BoundingBox.module.scss";
import { colors } from '../../utils/colors'

const BoundingBox = ({ boxes = [], onClick, dimensions, image, tagNames, tagsToBox }) => {
    const [hoverIndex, setHoverIndex] = useState(-1);
    const [bg, setBg] = useState();
    const canvas = useRef();

    const boxesToShow = () => {
        return boxes?.filter((box) => tagsToBox.includes(tagNames?.[box?.label]))
    }

    const bxsToShow = boxesToShow()

    useEffect(() => {
        initBackgroundAndCanvas();
        initCanvas()
    }, []);

    useEffect(() => {
        initCanvas();
    }, [hoverIndex, bg, boxes?.length, tagsToBox]);

    const initBackgroundAndCanvas = () => {
        const background = new Image();
        background.src = image;
        background.onload = ((e) => {
            canvas.current.width = background.width;
            canvas.current.height = background.height;
            setBg(background);
        });
    }

    const initCanvas = () => {
        if (!bg) return;
        const ctx = canvas?.current?.getContext('2d');
        ctx.clearRect(0, 0, canvas?.current?.width, canvas?.current?.height);
        ctx.drawImage(bg, 0, 0);
        renderBoxes();
    }

    const handleMouseMove = (e) => {
        const r = canvas?.current.getBoundingClientRect();
        const scaleX = canvas?.current.width / r?.width;
        const scaleY = canvas?.current.height / r?.height;
        const x = (e?.clientX - r?.left) * scaleX;
        const y = (e?.clientY - r?.top) * scaleY;
        const selectedBox = {
            index: -1,
            dimensions: null
        };
        bxsToShow.forEach((box, index) => {
            let { x: bx = 0, y: by = 0, width: bw = 0, height: bh = 0 } = unormalizeBox(box);
            if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
                const insideBox = !selectedBox?.dimensions || (
                    bx >= selectedBox?.dimensions[0] &&
                    bx <= selectedBox?.dimensions[0] + selectedBox?.dimensions[2] &&
                    by >= selectedBox?.dimensions[1] &&
                    by <= selectedBox?.dimensions[1] + selectedBox?.dimensions[3]
                );
                if (insideBox) {
                    selectedBox.index = boxes?.indexOf(box);
                    selectedBox.dimensions = [bx, by, bw, bh];
                }
            }
        });
        setHoverIndex(selectedBox?.index);
    }

    const handleMouseOut = () => {
        setHoverIndex(-1)
    }

    const handleClick = (e) => {
        if (hoverIndex === -1) return;
        const r = canvas?.current.getBoundingClientRect();
        const scaleX = canvas?.current.width / r?.width;
        const scaleY = canvas?.current.height / r?.height;
        const clientx = (e?.clientX - r?.left) * scaleX;
        const clienty = (e?.clientY - r?.top) * scaleY;
        const currentHoverBox = boxes?.[hoverIndex];
        let { x, y, width, height } = unormalizeBox(currentHoverBox);
        debugger;
        const insideX = clientx > x && clientx < x + width;
        const insideY = clienty > y && clienty < y + height;
        if (insideX && insideY) {
            onClick(hoverIndex)
        }
    }

    const renderBox = (box, selected) => {
        if (!box) return null;
        drawBox(box, selected);
    }

    const drawBox = (box, hover) => {
        if (!box || typeof box === 'undefined') {
            return null;
        }
        const sameSizeBoxes = bxsToShow.filter(bx => {
            const boxCord = box?.coord;
            const curCord = bx?.coord;
            const [curx, cury, curwidth, curheight] = curCord;
            const [boxx, boxy, boxwidth, boxheight] = boxCord;
            return boxx === curx && cury === boxy && curwidth === boxwidth && curheight === boxheight;
        })
        let color = colors.tags_colors[box?.label];
        let lineWidth = 2;
        const ctx = canvas?.current.getContext('2d');
        if (sameSizeBoxes.length > 1) {
            lineWidth = 7;
            color = colors.double;
        }
        let { x, y, width, height } = unormalizeBox(box);
        if (hover) {
            color = colors.selected;
            ctx.font = '12px Arial';
            ctx.fillStyle = color;
            const lbl = tagNames?.[box?.label];
            ctx.fillText(lbl, x + 3, y + height - 3);
        }
        if (x < lineWidth / 2) {
            x = lineWidth / 2;
        }
        if (y < lineWidth / 2) {
            y = lineWidth / 2;
        }
        if ((x + width) > canvas?.current.width) {
            width = canvas?.current.width - lineWidth - x;
        }
        if ((y + height) > canvas?.current.height) {
            height = canvas?.current.height - lineWidth - y;
        }
        // Left segment
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();

        // Right segment
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
    }

    const unormalizeBox = (box) => {
        const imgWidth = dimensions?.width;
        const imgHeight = dimensions?.height;
        if (!box) return {};
        const coord = box?.coord ? box?.coord : box;
        let [x, y, width, height] = [coord?.[0], coord?.[1], coord?.[2], coord?.[3]]
        width = width * imgWidth
        height = height * imgHeight
        x = (x * imgWidth) - (width / 2)
        y = (y * imgHeight) - (height / 2)
        return {
            x,
            y,
            width,
            height
        };
    }

    const renderBoxes = () => {
        bxsToShow.map((box, index) => {
            const selected = boxes.indexOf(box) === hoverIndex;
            return {
                box,
                index,
                selected
            };
        })
            .sort((a) => a.selected ? 1 : -1)
            .forEach(box => renderBox(box?.box, box?.selected));
    }


    return <canvas
        className={styles.canv}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseOut}
        style={{
            maxWidth: '100%',
            maxHeight: '90vh'
        }} ref={canvas}
    />;
}

export default BoundingBox;
