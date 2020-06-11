import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from "./BoundingBox.module.scss";

const colors = {
    normal: 'rgb(74,160,58)',
    selected: 'rgb(225,0,0)',
    unselected: 'rgba(0,225,204,1)',
    double: 'rgb(120,0,225)'
}

class BoundingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            canvas: undefined,
            canvasCreated: false,
            hoverIndex: -1,
            numberOfBoxes: 0
        };
        this.canvas = React.createRef();
    }

    componentDidMount() {
        this.setCanvas();
    }

    setCanvas() {
        this.setState({ numberOfBoxes: this.props?.boxes?.length })
        const ctx = this.canvas?.current?.getContext('2d');
        ctx.clearRect(0, 0, this.canvas?.current?.width, this.canvas?.current?.height);
        const background = new Image();
        background.src = this.props.options?.base64Image ? 'data:image/png;base64,' + this.props?.image : this.props?.image;
        background.onload = (() => {
            this.initCanvas(this.canvas?.current, background, ctx);
            ctx.drawImage(background, 0, 0);
            this.renderBoxes();
        });
    }

    componentDidUpdate() {
        if (this.state?.numberOfBoxes !== this.props?.boxes?.length) {
            this.setCanvas();
        }
    }

    initCanvas(canvas, background, ctx) {
        canvas.width = background.width;
        canvas.height = background.height;
        ctx.drawImage(background, 0, 0);
        this.renderBoxes();
        canvas.onmousemove = (e) => this.getOnmousemove(e, this.props, canvas);
        canvas.onmouseout = () => this.getOnmouseout();
        canvas.addEventListener('click', this.handleClick);
        if (canvas?.width !== background?.width && canvas?.height !== background?.height) {
            canvas.width = background?.width;
            canvas.height = background?.height;
        }
    }

    handleClick = () => {
        this.props.onClick(this.props?.name, this.state?.hoverIndex);
    }

    getOnmousemove(e, props, canvas) {
        const r = canvas.getBoundingClientRect();
        const scaleX = canvas?.width / r?.width;
        const scaleY = canvas?.height / r?.height;
        const x = (e?.clientX - r?.left) * scaleX;
        const y = (e?.clientY - r?.top) * scaleY;
        const selectedBox = {
            index: -1,
            dimensions: null
        };
        // eslint-disable-next-line no-unused-expressions
        this.props?.boxes?.forEach((box, index) => {
            let { x: bx = 0, y: by = 0, width: bw = 0, height: bh = 0 } = this.unormalizeBox(box, props?.dimensions?.width, props?.dimensions?.height);
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
        this.setState({ hoverIndex: selectedBox?.index }, this.renderBoxes);
    };


    getOnmouseout() {
        this.setState({ hoverIndex: -1 });
        this.renderBoxes();
    }

    renderBox(box, index, dimensions) {
        if (!box) return null;
        let hover = false;
        if (index === this.state.hoverIndex) {
            hover = true;
        }
        this.drawBox(this.canvas.current, box, hover, dimensions.width, dimensions.height);
        if (box.label) {
            this.drawLabel(this.canvas.current, hover, box)
        }
    }

    drawLabel(canvas, color, box) {
        if (!box || typeof box === 'undefined') {
            return null;
        }
        const ctx = canvas.getContext('2d');
        const coord = box?.coord ? box?.coord : box;
        let [x, y, width, height] = [coord?.[0], coord?.[1], coord?.[2], coord?.[3]]
        ctx.font = '25px Arial';
        ctx.fillStyle = color;
        ctx.fillText(box?.label, x + width / 2 - 20, y + height - 5);
    }

    drawBox(canvas, box, hover, imgWidth, imgHeight) {
        if (!box || typeof box === 'undefined') {
            return null;
        }
        const allBoxes = this.props?.boxes
        const sameSizeBoxes = allBoxes.filter(bx => {
            const boxCord = box?.coord;
            const curCord = bx?.coord;
            const [curx, cury, curwidth, curheight] = curCord;
            const [boxx, boxy, boxwidth, boxheight] = boxCord;
            return boxx === curx && cury === boxy && curwidth === boxwidth && curheight === boxheight;
        })
        let color = colors.normal;
        let lineWidth = 2;
        const ctx = canvas?.getContext('2d');
        if (sameSizeBoxes.length > 1) {
            lineWidth = 6;
            color = colors.double;
        }
        if (hover) {
            color = colors.selected;
        }
        let { x, y, width, height } = this.unormalizeBox(box, imgWidth, imgHeight);

        if (x < lineWidth / 2) {
            x = lineWidth / 2;
        }
        if (y < lineWidth / 2) {
            y = lineWidth / 2;
        }
        if ((x + width) > canvas?.width) {
            width = canvas?.width - lineWidth - x;
        }
        if ((y + height) > canvas?.height) {
            height = canvas?.height - lineWidth - y;
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

    unormalizeBox(box, imgWidth, imgHeight) {
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

    renderBoxes() {
        const boxes = this.props?.boxes
        const dimensions = this.props?.dimensions
        // eslint-disable-next-line no-unused-expressions
        boxes?.map((box, index) => {
            const selected = index === this.state?.hoverIndex;
            return {
                box,
                index,
                selected
            };
        })
            .sort((a) => a.selected ? 1 : -1)
            .forEach(box => this.renderBox(box?.box, box?.index, dimensions));
    }


    render() {
        return <canvas className={styles.canv} style={this.props?.options?.style} ref={this.canvas}/>;
    }
}

BoundingBox.propTypes = {
    image: PropTypes.string,
    boxes: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.array),
        PropTypes.arrayOf(PropTypes.object),
    ]),
    selectedIndex: PropTypes.number,
    onSelected: PropTypes.func,
    options: PropTypes.shape({
        colors: PropTypes.shape({
            normal: PropTypes.string,
            selected: PropTypes.string,
            unselected: PropTypes.string,
        }),
        style: PropTypes.object,
        base64Image: PropTypes.bool,
    }),
};

BoundingBox.defaultProps = {
    boxes: [],
    onSelected() {
    },
    options: {
        colors: {
            normal: 'rgba(255,225,255,1)',
            selected: 'rgba(0,225,204,1)',
            unselected: 'rgba(100,100,100,1)',
        },
        style: {
            maxWidth: '100%',
            maxHeight: '90vh',
        },
        base64Image: false,
    }
}

BoundingBox.defaultProps = {
    boxes: []
}

export default BoundingBox;
