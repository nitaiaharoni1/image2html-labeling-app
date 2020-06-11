import React, { useState, useEffect } from 'react';
import BoundingBox from "./BoundingBox";
import styles from "./Canvas.module.scss";

const Canvas = ({ fileName, img, txt }) => {
        const [url, setUrl] = useState();
        const [dimensions, setDimensions] = useState();
        const [boxes, setBoxes] = useState();
        const [lastRemovedBoxes, setLastRemovedBoxes] = useState([]);

        useEffect(() => {
            readImg();
            readTxt();
        }, []);

        const removeBox = (name, index) => {
            const bxs = [...boxes]
            const removedBox = bxs.splice(index, 1);
            setBoxes(bxs);
            setLastRemovedBoxes([...lastRemovedBoxes, ...removedBox])
        }

        const handleDownload = () => {
            const text = [];
            boxes.forEach(box => {
                text.push([box.label, ...box.coord].join(' '))
            })
            const element = document.createElement("a");
            const file = new Blob([text.join('\n')], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `${fileName}.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }

        const handleReset = () => {
            setBoxes(null)
            readTxt();
        }

        const handleUndo = () => {
            const previousBox = lastRemovedBoxes[lastRemovedBoxes.length - 1];
            const newLastRemovedBoxes = lastRemovedBoxes.filter(bx => bx !== previousBox)
            setBoxes([...boxes, previousBox])
            setLastRemovedBoxes(newLastRemovedBoxes)
        }

        const readImg = () => {
            const reader = new FileReader();
            reader.onload = function () {
                const Img = new Image();
                Img.onload = function () {
                    const ur = URL.createObjectURL(img);
                    const dimensions = {
                        width: Img.width,
                        height: Img.height
                    }
                    setUrl(ur)
                    setDimensions(dimensions)
                };
                Img.src = reader.result;
            }
            reader.readAsDataURL(img);
        }

        const readTxt = () => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const text = event?.target?.result?.toString();
                const lines = text?.split('\n');
                const boxes = lines?.map((line) => {
                    const [label, x, y, width, height] = line.split(' ');
                    return {
                        label,
                        coord: [x, y, width, height]
                    };
                })
                setBoxes(boxes)
            };
            reader.readAsText(txt);
        }

        return (
            <div style={{ margin: 60 }}>
                <div style={{ marginBottom: 10 }}>{fileName}</div>
                <div className={styles.canvas}>
                    {boxes && url && dimensions &&
                    <BoundingBox key={url} image={url} boxes={boxes}
                                 dimensions={dimensions} onClick={removeBox}/>}
                </div>
                <div className={styles.btnGroup}>
                    <button className={styles.buttonDownload}
                            onClick={handleDownload}>Download
                    </button>
                    <button className={styles.buttonReset}
                            onClick={handleReset}>Reset
                    </button>
                    <button className={styles.buttonUndo}
                            onClick={handleUndo}>Undo
                    </button>
                </div>
            </div>
        );
    }
;

export default Canvas;
