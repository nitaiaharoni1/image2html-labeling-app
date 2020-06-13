import React from 'react';
import styles from "./Nav.module.scss";

const Nav = ({onChange, onClick, fileNames }) => {
    return(
        <div className={styles.nav}>
        <div className={styles.inputWrapper}>
            <input className={styles.filesInput} style={{ width: fileNames.length > 0 ? 200 : 250 }} type="file"
                   id="files" name="files" multiple directory webkitdirectory onChange={onChange}/>
            {fileNames.length > 0 &&
            <button className={styles.downloadAll} onClick={onClick}>Download All</button>}
        </div>
    </div>);
}

export default Nav;
