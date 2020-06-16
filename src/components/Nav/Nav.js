import React from 'react';
import styles from "./Nav.module.scss";

const Nav = ({onChange, onClickDownload, onClickFiles, fileNames }) => {
    return(
        <div className={styles.nav}>
        <div className={styles.inputWrapper}>
            <input className={styles.filesInput} style={{ width: fileNames.length > 0 ? 200 : 250 }} type="file"
                   id="files" name="files" multiple directory webkitdirectory onClick={onClickFiles} onChange={onChange}/>
            {fileNames.length > 0 &&
            <button className={styles.downloadAll} onClick={onClickDownload}>Download All</button>}
        </div>
    </div>);
}

export default Nav;
