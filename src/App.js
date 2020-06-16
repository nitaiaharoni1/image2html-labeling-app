import React, { useState } from 'react';
import { ComponentFrame, Nav } from './components';
import styles from "./App.module.scss";

function App() {
    const [fileNames, setFileNames] = useState([]);
    const [files, setFiles] = useState({});

    const handleFilesChosen = (e) => {
        const files = {}
        const AllFiles = Array.from(e.target.files);
        const fileNamess = Array.from(AllFiles)
            .map((file) => file.name.split('.')[0])
            .filter((x, i, a) => a.indexOf(x) === i);
        fileNamess.forEach((fileName, index) => {
            const img = AllFiles.filter((file) => file.name === `${fileName}.jpeg`)[0]
            const txt = AllFiles.filter((file) => file.name === `${fileName}.txt`)[0]
            files[fileName] = {
                txt,
                img
            };
            if (index === fileNamess.length - 1) {
                setFileNames(fileNamess);
                setFiles(files);
            }
        })
    }

    const handleDownloadAll = () => {
        const elements = Array.from(document.querySelectorAll('[class*="buttonDownload"]'));
        elements.forEach((element) => element.click())
    }


    return (
        <div className={styles.app}>
            <Nav onChange={handleFilesChosen} onClick={handleDownloadAll}
                 fileNames={fileNames}/>
            {fileNames.map((fileName, index) => {
                const filez = files[fileName];
                const img = filez.img;
                const txt = filez?.txt;
                return <ComponentFrame fileName={fileName}
                               fileNum={index + 1}
                               img={img}
                               txt={txt}/>
            })}
        </div>
    );
}

export default App;
