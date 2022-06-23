import React, { useEffect, useRef, useState } from "react";
import "./drop-file-input.css";
import { ImageConfig } from "../../config/ImageConfig";
import { Buffer } from "buffer";
import uploadImg from "../../assets/cloud-upload-regular-240.png";
import Geocode from "react-geocode";
import Progress_bar from "../ProgressBar";
import { Progress } from "reactstrap";
import Tesseract from "tesseract.js";

const { createWorker } = require("tesseract.js");
const PDFJS = require("pdfjs-dist/build/pdf.js");
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
const DropFileInput = (props) => {
  const wrapperRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [email, setEmail] = useState("");
  const [experience, setExperiennce] = useState("");
  const [phone, setPhone] = useState([]);
  const [altPhone, setAltPhone] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [skype, setSkype] = useState("");
  const [image, setImage] = useState("");

  const [imagePath, setImagePath] = useState("");
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [string, setString] = useState("");
  const [contactValue, setContact] = useState(true);
  const [text, setText] = useState("");
  const [Location, setLocation] = useState([
    "Bhubaneswar/Orissa",
    "New Delhi/NCR",
    "Bangaluru",
    "Kolkata",
    "Hyderabad",
    "Mumbai",
    "Pune",
  ]);
  const [pdfWithImage, setPdfWithImage] = useState(false);
  const onDragEnter = () => wrapperRef.current.classList.add("dragover");
  const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
  const onDrop = () => wrapperRef.current.classList.remove("dragover");
  Geocode.setApiKey("AIzaSyDgKQPnFkQ_nX4BtOemDruaLFojMwZI6hc");
  Geocode.setLanguage("en");
  Geocode.setRegion("es");
  Geocode.setLocationType("ROOFTOP");
  Geocode.enableDebug();
  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://maps.google.com/maps/api/js?key=AIzaSyDgKQPnFkQ_nX4BtOemDruaLFojMwZI6hc";
    script.async = true;

    document.body.appendChild(script);
  }, []);
  useEffect(() => {
    if (imagePath !== "") {
      handleClick();
    }
  }, [imagePath]);

  useEffect(() => {
    if (text !== "") {
      handleText();
    }
  }, [text]);
  useEffect(() => {}, [progress, showProgress]);
  useEffect(() => {
    if (pdfWithImage) {
      handlePdfWithImage();
    }
  }, [pdfWithImage]);
  const handleCity = () => {};
  function getPosition() {
    let checkCity = true;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (location) {
        Geocode.fromLatLng(
          location.coords.latitude,
          location.coords.longitude
        ).then(
          (response) => {
            const address = response.results[0].formatted_address;
            let city, state, country;
            for (
              let i = 0;
              i < response.results[0].address_components.length;
              i++
            ) {
              for (
                let j = 0;
                j < response.results[0].address_components[i].types.length;
                j++
              ) {
                switch (response.results[0].address_components[i].types[j]) {
                  case "locality":
                    city = response.results[0].address_components[i].long_name;
                    break;
                  case "administrative_area_level_1":
                    state = response.results[0].address_components[i].long_name;
                    break;
                  case "country":
                    country =
                      response.results[0].address_components[i].long_name;
                    break;
                }
              }
            }
            for (let i = 0; i < Location.length; i++) {
              if (Location[i].includes(city) && currentLocation === "") {
                setCurrentLocation(Location[i]);
                checkCity = false;
                break;
              }
            }
            console.log(checkCity);
            if (checkCity && currentLocation === "") {
              let liveLocation = [...Location, city];
              setLocation(liveLocation);
              setCurrentLocation(city);
              checkCity = false;
            }
            console.log(checkCity);
          },
          (error) => {}
        );
      });
    }
  }

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
  const handlePdfWithImage = async () => {
    let file = fileList[fileList.length - 1];
    const images = [];
    const image = [];
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
    let localImage = [];
    let imageBuffer = [];
    for (let i = 0; i < images.length; i++) {
      localImage[i] = images[i].substring(22, images[i].length);
      imageBuffer[i] = Buffer.from(localImage[i], "base64");
    }
    const worker = createWorker({
      logger: (m) => {
        if (m.status === "recognizing text") {
          setShowProgress(true);
          setProgress(parseInt(m.progress * 100));
        }
      },
    });

    (async () => {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      for (let i = 0; i < imageBuffer.length; i++) {
        const {
          data: { text },
        } = await worker.recognize(imageBuffer[i]);

        let emailId = text.match(
          /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
        );
        if (emailId !== null) setEmail(emailId[0]);
        let contact = text.match(/(?:[-+() ]*\d){10,13}/g);
        if (contact !== null) {
          for (let i = 0; i < contact.length; i++) {
            if (contact[i].trim().length === 6) {
              break;
            } else if (
              contact[i].trim().length > 9 &&
              contact[i].trim().length < 14
            )
              setPhone(contact[i]);
            break;
          }
        }
      }
      setShowProgress(false);
      await worker.terminate();
    })();
  };
  const handleText = () => {
    let number = [];
    let emailId = text.match(
      /([a-zA-Z._-][\s]?[a-zA-Z0-9._-]+[\s]?@[a-zA-Z0-9._-]+[\s]?\.[a-zA-Z0-9_-]+)/gi
    );
    let emaiIdTrim = emailId !== null ? emailId[0].trim() : "";
    if (emailId !== null) setEmail(emaiIdTrim.replace(" ", ""));
    let contact = text.match(
      /(\s+?\+[0-9]{2}\-)?(\s+[0]{1})?([6-9]{1})([0-9]{9})/g
    );
    console.log(contact, text);
    if (contact !== null) {
      for (let i = 0; i < contact.length; i++) {
        let phoneTrim = contact !== null ? contact[i].trim() : "";
        if (contact[i].trim().length > 9 && contact[i].trim().length < 18) {
          number.push(phoneTrim.replace(" ", ""));
        }
      }
      setPhone(number);
    }
  };
  const handleClick = () => {
    Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        setShowProgress(true);
        if (m.status === "recognizing text") {
          setProgress(parseInt(m.progress * 100));
        }
      },
    }).then(({ data: { text } }) => {
      setText(text);
      setShowProgress(false);
    });
  };
  const onFileDrop = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      setEmail("");
      setPhone(["", ""]);
      const updatedList = [newFile];
      getPosition();
      setFileList(updatedList);
      if (newFile.type == "application/pdf") {
        var fReader = new FileReader();
        fReader.readAsDataURL(newFile);
        fReader.onloadend = function (event) {
          convertDataURIToBinary(event.target.result);
        };
      } else if (newFile.type == "image/jpeg") {
        setImagePath(URL.createObjectURL(e.target.files[0]));
      }
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
    await PDFJS.getDocument(pdfAsArray).promise.then(
      function (pdf) {
        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < pdf._pdfInfo.numPages; i++) {
          (function (pageNumber) {
            pagesPromises.push(getPageText(pageNumber, pdfDocument));
          })(i + 1);
        }
        Promise.all(pagesPromises).then(function (pagesText) {
          var outputStr = "";
          for (var pageNum = 0; pageNum < pagesText.length; pageNum++) {
            setText(JSON.stringify(pagesText[pageNum]));
            if (pagesText.length > 0 && pageNum == 0 && pagesText[0] == "") {
              setPdfWithImage(true);
            }
            var re = /[^< ]+(?=>)/g;
            outputStr = "";
            outputStr =
              "<br/><br/>Page " + (pageNum + 1) + " contents <br/> <br/>";
            var div = document.getElementById("output");
            div.innerHTML += outputStr + pagesText[pageNum];
          }
        });
      },
      function (reason) {
        console.error(reason);
      }
    );
  }

  function getPageText(pageNum, PDFDocumentInstance) {
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
          resolve(finalString);
        });
      });
    });
  }
  const fileRemove = (file) => {
    const updatedList = [...fileList];
    const updatedPhone = [];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
    setEmail("");
    setText("");
    setPhone(updatedPhone);
    //setAltPhone("");
  };
  const handleFiles = (files) => {
    let reader = new FileReader();
    reader.onload = function () {
      alert("Read Data : " + reader.result);
    };

    reader.readAsText(files[0]);
  };
  return showProgress ? (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Progress_bar bgcolor="orange" progress={progress} />
    </div>
  ) : (
    <>
      <div
        ref={wrapperRef}
        className="drop-file-input"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div
          className="drop-file-input__label"
          style={{
            display: "flex",
            width: "100%",
          }}
        >
          <div
            style={{
              justifyContent: "end",
              width: "30%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 512 512"
              color="#ccc"
              height="30px"
              width="30px"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "rgb(204, 204, 204)" }}
            >
              <path d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
            </svg>
          </div>
          <div style={{ width: "70%", display: "flex", marginLeft: "7%" }}>
            <div
              style={{
                width: "auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div>
                <div>
                  <label style={{ fontSize: "1.3rem" }}>
                    Drag & Drop a files here(PDF only)
                  </label>
                </div>

                <div style={{ marginTop: "2%" }}>
                  <button
                    style={{
                      outline: "none",
                      border: "none",
                      borderRadius: "3px",
                      fontSize: "1rem",

                      backgroundColor: "#d10000",
                      color: "white",
                      padding: "0.5rem 1rem",
                    }}
                  >
                    Browse File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <input type="file" onChange={(e) => onFileDrop(e)} id="file-id" />
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

      <div style={{ marginTop: "15px" }}>
        {/* <h2 style={{ color: "var(--border-color)" }}>Personal Information</h2> */}
        <legend
          style={{
            fontFamily: "Nunito Sans Bold,sans-serif",
            fontWeight: "900",
            fontSize: "1.5rem",
            color: "red",
          }}
        >
          Personal Information
        </legend>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <div className="form">
            <input
              type="text"
              id="fullName"
              className="form__input"
              placeholder=" "
            />
            <label for="fullName" className="form__label">
              Full Name
              <span style={{ color: "red", fontWeight: "600" }}> *</span>
            </label>
          </div>
          <div className="form">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              className="form__input"
              placeholder=" "
            />
            <label for="email" className="form__label">
              Email<span style={{ color: "red" }}> *</span>
            </label>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <div className="form">
            <input
              id="dob"
              type="date"
              className="form__input"
              placeholder=" "
            />
            <label for="dob" className="form__label">
              Date Of Birth<span style={{ color: "red" }}> *</span>
            </label>
          </div>
          <div className="form">
            <input
              type="text"
              id="skype"
              className="form__input"
              placeholder=" "
            />
            <label for="skype" className="form__label">
              Skype Id
            </label>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <div className="form">
            <input
              className="form__input"
              type="text"
              placeholder=" "
              value={phone[0]}
              onChange={(e) => {
                let contact = [...phone];
                contact[0] = e.target.value;
                setPhone(contact);
              }}
            />
            <label for="phone" className="form__label">
              Phone Number<span style={{ color: "red" }}> *</span>
            </label>
          </div>
          <div className="form">
            <input
              type="tel"
              className="form__input"
              placeholder=" "
              value={phone[1]}
              onChange={(e) => {
                let contact = [...phone];
                contact[1] = e.target.value;
                setPhone(contact);
              }}
            />
            <label for="phone" className="form__label">
              Alternate Phone Number
            </label>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <div className="form">
            <input type="text" className="form__input" placeholder=" " />
            <label for="alternatePhoneNumber" className="form__label">
              Linkedin Profile Link
            </label>
          </div>
        </div>
        <legend
          style={{
            fontFamily: "Nunito Sans Bold,sans-serif",
            fontWeight: "900",
            fontSize: "1.5rem",
            color: "red",
            marginTop: "15px",
          }}
        >
          Location
        </legend>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <div className="dd_location">
            <select
              id="current_location"
              style={{
                width: "100%",
                padding: "2%",
                backgroundColor: " lightgrey",
                border: "1px solid black",
              }}
              className="form-select"
              aria-label="Default select example"
              value={currentLocation}
            >
              <option style={{ backgroundColor: "white" }} value="">
                Select Current Location*
              </option>
              {Location.map((n) => {
                return (
                  <option style={{ backgroundColor: "white" }} value={n}>
                    {n}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="dd_location">
            <select
              id="preferred_location"
              style={{
                width: "100%",
                padding: "2%",
                backgroundColor: " lightgrey",
                border: "1px solid black",
              }}
              className="form-select"
              aria-label="Default select example"
            >
              <option style={{ backgroundColor: "white" }} value="">
                Select Preferred Location*
              </option>
              <option style={{ backgroundColor: "white" }} value="Bhubaneswar">
                Bhubaneswar
              </option>
              <option style={{ backgroundColor: "white" }} value="Delhi - NCR">
                Delhi - NCR
              </option>
              <option
                style={{ backgroundColor: "white" }}
                value="Remote Working"
              >
                Remote Working
              </option>
            </select>
          </div>
        </div>
        <legend
          style={{
            fontFamily: "Nunito Sans Bold,sans-serif",
            fontWeight: "900",
            fontSize: "1.5rem",
            color: "red",
            marginTop: "15px",
          }}
        >
          Professional Details
        </legend>
        <div style={{ marginTop: "15px" }}>
          <label style={{ fontWeight: "700" }}>
            Work Experience
            <span style={{ color: "red", fontWeight: "900" }}>*</span>
          </label>
          <input
            type="radio"
            checked={experience == "fresher" ? true : false}
            style={{ marginLeft: "25px" }}
            onClick={(e) => setExperiennce(e.target.value)}
            value="fresher"
          />
          <label style={{ fontWeight: "600", marginLeft: "10px" }}>
            Fresher
          </label>
          <input
            type="radio"
            checked={experience == "less" ? true : false}
            style={{ marginLeft: "25px" }}
            onClick={(e) => setExperiennce(e.target.value)}
            value="less"
          />
          <label style={{ fontWeight: "600", marginLeft: "10px" }}>
            Less Than One Year
          </label>
          <input
            type="radio"
            checked={experience == "more" ? true : false}
            style={{ marginLeft: "25px" }}
            onClick={(e) => setExperiennce(e.target.value)}
            value="more"
          />
          <label style={{ fontWeight: "600", marginLeft: "10px" }}>
            More Than One Year
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button
            style={{
              background: "red",
              color: "white",
              fontSize: "18px",
              padding: "8px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {" "}
            Submit
          </button>
        </div>
      </div>
    </>
  );
};
//DropFileInput.PropTypes = {};

export default DropFileInput;
