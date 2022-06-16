import React, { useRef, useState } from "react";
import "./drop-file-input.css";
import { ImageConfig } from "../config/ImageConfig";
import uploadImg from "../assets/cloud-upload-regular-240.png";
import Tesseract from "tesseract.js";
const PDFJS = require("pdfjs-dist/build/pdf.js");
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
const DropFileInput = (props) => {
  const wrapperRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [text, setText] = useState("");
  const onDragEnter = () => wrapperRef.current.classList.add("dragover");
  const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
  const onDrop = () => wrapperRef.current.classList.remove("dragover");
  const onFileDrop = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      const updatedList = [...fileList, newFile];
      setFileList(updatedList);
      console.log(newFile.type);
      //   if (newFile.type == "application/pdf") {
      //     var fReader = new FileReader();
      //     fReader.readAsDataURL(newFile);
      //     fReader.onloadend = function (event) {
      //       console.log(event);
      //       convertDataURIToBinary(event.target.result);
      //     };
      //   } else if (newFile.type == "image/jpeg") {
      setImagePath(URL.createObjectURL(e.target.files[0]));
      Tesseract.recognize(imagePath, "eng", {
        logger: (m) => {
          console.log(m);
        },
      }).then(({ data: { text } }) => {
        setText(text);
        console.log(text);
      });
    }
  };
  var BASE64_MARKER = ";base64,";

  function convertDataURIToBinary(dataURI) {
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array);
  }
  async function pdfAsArray(pdfAsArray) {
    console.log(pdfAsArray);
    await PDFJS.getDocument(pdfAsArray).promise.then(
      function (pdf) {
        console.log(pdf);
        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < pdf._pdfInfo.numPages; i++) {
          // Required to prevent that i is always the total of pages
          (function (pageNumber) {
            // Store the promise of getPageText that returns the text of a page
            pagesPromises.push(getPageText(pageNumber, pdfDocument));
          })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {
          // Display text of all the pages in the console
          // e.g ["Text content page 1", "Text content page 2", "Text content page 3" ... ]
          console.log(pagesText); // representing every single page of PDF Document by array indexing
          console.log(pagesText.length);

          var outputStr = "";
          for (var pageNum = 0; pageNum < pagesText.length; pageNum++) {
            console.log(pagesText[pageNum]);
            outputStr = "";
            outputStr =
              "<br/><br/>Page " + (pageNum + 1) + " contents <br/> <br/>";
            var div = document.getElementById("output");
            div.innerHTML += outputStr + pagesText[pageNum];
          }
        });
      },
      function (reason) {
        // PDF loading error
        console.error(reason);
      }
    );
  }
  function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
      PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
        // The main trick to obtain the text of the PDF page, use the getTextContent method
        pdfPage.getTextContent().then(function (textContent) {
          var textItems = textContent.items;
          var finalString = "";

          // Concatenate the string of the item to the final string
          for (var i = 0; i < textItems.length; i++) {
            var item = textItems[i];

            finalString += item.str + " ";
          }

          // Solve promise with the text retrieven from the page
          resolve(finalString);
        });
      });
    });
  }
  const fileRemove = (file) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
  };
  const handleFiles = (files) => {
    let reader = new FileReader();
    console.log(files);
    reader.onload = function () {
      alert("Read Data : " + reader.result);
    };

    reader.readAsText(files[0]);
  };
  console.log(fileList);
  return (
    <>
      <div
        ref={wrapperRef}
        className="drop-file-input"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="drop-file-input__label">
          <img src={uploadImg} alt="" />
          <p>Drag & Drop your files here</p>
        </div>
        <input type="file" value="" onChange={onFileDrop} id="file-id" />
      </div>
      {fileList.length > 0 ? (
        <div className="drop-file-preview">
          <p className="drop-file-preview__title">Ready to upload</p>
          {fileList.map((item, index) => (
            <div key={index} className="drop-file-preview__item">
              <img
                src={
                  ImageConfig[item.type.split("/")[1]] || ImageConfig["default"]
                }
                alt=""
              />
              <div className="drop-file-preview__item__info">
                <p>{item.name}</p>
                <p>{item.size}B</p>
              </div>
              <span
                className="drop-file-preview__item__del"
                onClick={() => fileRemove(item)}
              >
                x
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
};
//DropFileInput.PropTypes = {};

export default DropFileInput;
