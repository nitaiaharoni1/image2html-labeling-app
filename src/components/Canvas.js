import React, { useState, useEffect } from 'react';
import BoundingBox from "./BoundingBox";
import styles from "./Canvas.module.scss";
import Checkboxes from "./Checkboxes";

let tagNames = [
    "a",
    "button",
    "div",
    "form",
    "h1",
    "hr",
    "img",
    "input",
    "li",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "table",
    "td",
    "textarea",
    "th",
    "tr",
    "ul",
    "video"
];

const Canvas = ({ fileName, fileNum, img, txt }) => {
        const [url, setUrl] = useState();
        const [dimensions, setDimensions] = useState();
        const [boxes, setBoxes] = useState([]);
        const [tagsToBox, setTagsToBox] = useState([]);
        const [lastRemovedBoxes, setLastRemovedBoxes] = useState([]);


        useEffect(() => {
            readImg();
            readTxt();
        }, []);

        const handleChecked = (tagsToBox) => {
            setTagsToBox(tagsToBox);
        }

        const removeBox = (index) => {
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
            try {
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
            } catch (e) {
                console.error('IMG', fileName, e)
            }
        }

        const readTxt = () => {
            try {
                const reader = new FileReader();
                reader.addEventListener("load", (e) => {
                    const text = e?.target?.result?.toString();
                    const lines = text?.split('\n');
                    const boxes = lines?.map((line) => {
                        const [label, x, y, width, height] = line.split(' ');
                        return {
                            label,
                            coord: [x, y, width, height]
                        };
                    })
                    setBoxes(boxes)
                });
                reader.readAsText(txt);
            } catch (e) {
                console.error('TXT', fileName, e)
                readTxt();
            }
        }

        return (
            <div style={{ margin: 60 }}>
                <div className={styles.topRow}>
                    <div className={styles.fileName}>
                        {`${fileNum}. ${fileName}`}
                        <input style={{width: 20, height: 20}} type="checkbox"/>
                    </div>
                    {boxes?.length > 0 &&
                    <Checkboxes onChecked={handleChecked} boxes={boxes}
                                tagNames={tagNames}/>}
                <div style={{width: '15%'}}/>
                </div>
                <div className={styles.canvas}>
                    {url && dimensions &&
                    <BoundingBox key={url}
                                 image={url}
                                 dimensions={dimensions}
                                 boxes={boxes}
                                 tagNames={tagNames}
                                 tagsToBox={tagsToBox}
                                 onClick={removeBox}/>
                    }
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
