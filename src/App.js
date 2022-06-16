import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import "./App.css";
import { PDFtoIMG } from "react-pdf-to-image";
//import file from "./pdf-sample.pdf";
const PDFJS = require("pdfjs-dist/build/pdf.js");

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
//import file from "./Resume_Akash_Basic.pdf";

function App() {
  const [imagePath, setImagePath] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  useEffect(() => {
    if (image !== "") {
      handleImage();
    }
  }, [imagePath]);
  const handleImage = () => {};
  const handleClick = () => {
    Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        console.log(m);
      },
    }).then(({ data: { text } }) => {
      setText(text);
      console.log(text);
    });
  };
  const readFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  };
  const handleChange = async (e) => {
    console.log(e.target.files[0]);
    let file = e.target.files[0];
    const images = [];
    const data = await readFileData(file);
    const pdf = await PDFJS.getDocument(data).promise;
    const canvas = document.createElement("canvas");
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1 });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      images.push(canvas.toDataURL());
    }
    canvas.remove();
    setImage(images);
    return images;
  };
  console.log(image);
  return (
    <div className="App">
      <main className="App-main">
        {image.length
          ? image.map((n) => {
              return (
                <div>
                  <img src={n} className="App-image" alt="logo" />
                </div>
              );
            })
          : ""}

        <h3>Extracted text</h3>
        <div className="text-box">
          <p> {text} </p>
        </div>
        <input type="file" onChange={handleChange} />
        {/* <image src={image[0]} /> */}
      </main>
    </div>
  );
}
export default App;
