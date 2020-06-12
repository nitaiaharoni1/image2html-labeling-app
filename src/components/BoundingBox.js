import React, { useRef, useEffect, useState } from 'react';
import styles from "./BoundingBox.module.scss";

const colors = {
    normal: 'rgb(74,160,58)',
    selected: 'rgb(225,0,0)',
    unselected: 'rgba(0,225,204,1)',
    double: 'rgb(120,0,225)'
}

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
    }, [bg, boxes.length, tagsToBox]);

    useEffect(() => {
        renderBoxes();
    }, [hoverIndex]);

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
        // eslint-disable-next-line no-unused-expressions
        bxsToShow?.forEach((box, index) => {
            let { x: bx = 0, y: by = 0, width: bw = 0, height: bh = 0 } = unormalizeBox(box, dimensions?.width, dimensions?.height);
            if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
                const insideBox = !selectedBox?.dimensions || (
                    bx >= selectedBox?.dimensions[0] &&
                    bx <= selectedBox?.dimensions[0] + selectedBox?.dimensions[2] &&
                    by >= selectedBox?.dimensions[1] &&
                    by <= selectedBox?.dimensions[1] + selectedBox?.dimensions[3]
                );
                if (insideBox) {
                    selectedBox.index = index;
                    selectedBox.dimensions = [bx, by, bw, bh];
                }
            }
        });
        setHoverIndex(selectedBox?.index);
    }

    const handleMouseOut = () => {
        setHoverIndex(-1)
    }

    const renderBox = (box, selected, dimensions) => {
        if (!box) return null;
        drawBox(box, selected, dimensions.width, dimensions.height);
        if (box.label) {
            drawLabel(selected, box)
        }
    }

    const drawLabel = (color, box) => {
        if (!box || typeof box === 'undefined') {
            return null;
        }
        const ctx = canvas?.current.getContext('2d');
        const coord = box?.coord ? box?.coord : box;
        let [x, y, width, height] = [coord?.[0], coord?.[1], coord?.[2], coord?.[3]]
        ctx.font = '25px Arial';
        ctx.fillStyle = color;
        ctx.fillText(box?.label, x + width / 2 - 20, y + height - 5);
    }

    const drawBox = (box, hover, imgWidth, imgHeight) => {
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
        let color = colors.normal;
        let lineWidth = 2;
        const ctx = canvas?.current.getContext('2d');
        if (sameSizeBoxes.length > 1) {
            lineWidth = 6;
            color = colors.double;
        }
        if (hover) {
            color = colors.selected;
        }
        let { x, y, width, height } = unormalizeBox(box, imgWidth, imgHeight);

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

    const unormalizeBox = (box, imgWidth, imgHeight) => {
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
            const selected = index === hoverIndex;
            return {
                box,
                index,
                selected
            };
        })
            .sort((a) => a.selected ? 1 : -1)
            .forEach(box => renderBox(box?.box, box?.selected, dimensions));
    }


    return <canvas
        className={styles.canv}
        onClick={() => onClick(hoverIndex)}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
        style={{
            maxWidth: '100%',
            maxHeight: '90vh'
        }} ref={canvas}
    />;
}

export default BoundingBox;
