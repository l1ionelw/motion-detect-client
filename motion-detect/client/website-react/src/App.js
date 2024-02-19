import logo from './logo.svg';
import './App.css';
import Redirect from "./pages/Redirect";
import SetAPI from "./pages/SetAPI";

function App() {
    const API_URL = localStorage.getItem("api_url")
    if (API_URL == null) {
        return (<Redirect href={"/set_api/"}/>)
    } else {
        return (<Redirect href={"/content/"}/>)
    }
}

export default App;
