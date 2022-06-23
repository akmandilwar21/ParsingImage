import "./App.css";
import DropFileInput from "./components/drop-file-input/DropFileInput";
import Header from "./components/Header/Header";
function App() {
  return (
    <div>
      <div>
        <Header />
      </div>
      <div className="container">
        <div className="box">
          <DropFileInput />
        </div>
      </div>
    </div>
  );
}

export default App;
