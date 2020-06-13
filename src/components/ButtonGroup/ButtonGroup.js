import React from 'react';
import styles from "./ButtonGroup.module.scss";
import clsx from "clsx";

const ButtonGroup = ({ onDownload, onReset, onUndo }) => {
        return (
            <div className={styles.btnGroup}>
                <button className={clsx([styles.btn, styles.download])}
                        onClick={onDownload}>Download
                </button>
                <button className={clsx([styles.btn, styles.reset])}
                        onClick={onReset}>Reset
                </button>
                <button className={clsx([styles.btn, styles.undo])}
                        onClick={onUndo}>Undo
                </button>
            </div>
        );
    }
;

export default ButtonGroup;
