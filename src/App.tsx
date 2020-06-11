import React, { useState } from 'react';
import Canvas from "./components/Canvas";
import styles from "./App.module.scss";

function App() {
  const [fileNames, setFileNames] = useState([]);
  const [files, setFiles] = useState({});

  const handleChange = (e: any) => {
    // @ts-ignore
    const files = {}
    const AllFiles = Array.from(e.target.files);
    // @ts-ignore
    const fileNamez = Array.from(AllFiles).map((file: any) => file.name.split('.')[0]).filter((x, i, a) => a.indexOf(x) === i);
    fileNamez.forEach((fileName: string, index: number) => {
      const img = AllFiles.filter((file: any) => file.name === `${fileName}.jpeg`)[0]
      const txt = AllFiles.filter((file: any) => file.name === `${fileName}.txt`)[0]
      // @ts-ignore
      files[fileName] = { txt, img };
      if (index === fileNamez.length - 1) {
        // @ts-ignore
        setFileNames(fileNamez);
        // @ts-ignore
        setFiles(files);
      }
    })
  }

  const handleDownloadAll = () => {
    const elements = Array.from(document.querySelectorAll('[class*="buttonDownload"]'));
    elements.forEach((element: any) => element.click())
  }


  return (
    <div className={styles.app}>
      <div className={styles.nav}>
        <div className={styles.inputWrapper}>
          <input className={styles.filesInput} style={{ width: fileNames.length > 0 ? 160 : 250 }} type="file"
                 id="files" name="files" multiple
                 onChange={handleChange}/>
          {fileNames.length > 0 &&
          <button className={styles.downloadAll} onClick={handleDownloadAll}>Download All</button>}
        </div>
      </div>
      {fileNames.map((fileName, index) => {
        const filez = files[fileName];
        // @ts-ignore
        const img = filez.img;
        // @ts-ignore
        const txt = filez?.txt;
        return (
          <div key={fileName}>
            <Canvas fileName={fileName} fileNum={index + 1} img={img} txt={txt}/>
            <hr/>
          </div>)
      })}
    </div>
  );
}

export default App;
