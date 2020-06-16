import React, { useState } from 'react';
import { ComponentFrame, Nav } from './components';
import styles from "./App.module.scss";

function App() {
    const [fileNames, setFileNames] = useState([]);
    const [files, setFiles] = useState({});

    const handleClickFiles = () => {
        if (fileNames.length > 0 || files !== {}) {
            setFileNames([]);
            setFiles({});
        }
    }

    const handleFilesChosen = (e) => {
        const filess = {}
        const AllFiles = Array.from(e.target.files);
        const fileNamess = Array.from(AllFiles)
            .map((file) => file.name.split('.')[0])
            .filter((x, i, a) => a.indexOf(x) === i);
        fileNamess.forEach((fileName, index) => {
            const img = AllFiles.filter((file) => file.name === `${fileName}.jpeg`)[0]
            const txt = AllFiles.filter((file) => file.name === `${fileName}.txt`)[0]
            filess[fileName] = {
                txt,
                img
            };
            if (index === fileNamess.length - 1) {
                setFileNames(fileNamess);
                setFiles(filess);
            }
        })
    }

    function clickDownload(element) {
        try {
            element.click()
        } catch (e) {
            console.error('Can\'t click')
        }
    }

    const handleDownloadAll = () => {
        const elements = Array.from(document.querySelectorAll('[class*="ButtonGroup_download"]'));
        elements.forEach((element, index) => {
            setTimeout(() => clickDownload(element), 200 * index);
        })
    }


    return (
        <div className={styles.app}>
            <Nav onChange={handleFilesChosen} onClickFiles={handleClickFiles}
                 onClickDownload={handleDownloadAll}
                 fileNames={fileNames}/>
            {fileNames.map((fileName, index) => {
                const filez = files[fileName];
                const img = filez.img;
                const txt = filez?.txt;
                return <ComponentFrame fileName={fileName}
                                       fileNum={index + 1}
                                       img={img}
                                       key={fileName}
                                       txt={txt}/>
            })}
        </div>
    );
}

export default App;
