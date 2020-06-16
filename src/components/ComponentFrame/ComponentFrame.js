import React, { useState, useEffect } from 'react';
import { ComponentCanvas, Checkboxes, ButtonGroup } from '..';
import styles from "./ComponentFrame.module.scss";

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

const ComponentFrame = ({ fileName, fileNum, img, txt }) => {
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
            const elementTxt = document.createElement("a");
            const elementImg = document.createElement("a");
            const file = new Blob([text.join('\n')], { type: 'text/plain' });
            elementTxt.href = URL.createObjectURL(file);
            elementImg.href = URL.createObjectURL(img);
            elementTxt.download = `${fileName}.txt`;
            elementImg.download = `${fileName}.jpeg`;
            document.body.appendChild(elementTxt);
            document.body.appendChild(elementImg);
            elementTxt.click();
            elementImg.click();
            document.body.removeChild(elementTxt);
            document.body.removeChild(elementImg);
        }

        const handleReset = () => {
            const dim = { ...dimensions };
            setDimensions(null);
            readTxt();
            setDimensions(dim);
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
            <div key={fileName}>
                <div style={{ margin: 60 }}>
                    <div className={styles.topRow}>
                        <div className={styles.fileName}>
                            {`${fileNum}. ${fileName}`}
                            <input style={{
                                width: 20,
                                height: 20
                            }} type="checkbox"/>
                        </div>
                        {boxes?.length > 0 &&
                        <Checkboxes onChecked={handleChecked} boxes={boxes}
                                    tagNames={tagNames}/>}
                        <div style={{ width: '15%' }}/>
                    </div>
                    <div className={styles.canvas}>
                        {url && dimensions &&
                        <ComponentCanvas key={url}
                                     image={url}
                                     dimensions={dimensions}
                                     boxes={boxes}
                                     tagNames={tagNames}
                                     tagsToBox={tagsToBox}
                                     onClick={removeBox}/>
                        }
                    </div>
                    <ButtonGroup onDownload={handleDownload} onReset={handleReset}
                                 onUndo={handleUndo}/>
                </div>
                <hr/>
            </div>
        );
    }
;

export default ComponentFrame;
