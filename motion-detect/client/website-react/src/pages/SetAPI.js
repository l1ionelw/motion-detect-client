import {useState} from "react";
import Redirect from "./Redirect";

export default function SetAPI() {
    const [ip, setip] = useState("")
    const [completionState, setCompletionState] = useState("Completing")

    function inputChanged(val) {
        setip(val.trim());
    }

    function submitForm(e) {
        e.preventDefault()
        localStorage.setItem("api_url", ip)
        setCompletionState("Completed")
    }

    if (completionState === "Completing") {
        return (
            <div id={"login"}>
                <h1>Server API</h1>
                <p>Input the IP of your server here: </p>
                <form onSubmit={submitForm}>
                    <label htmlFor={"ip"}>IP Address: </label>
                    <input type={"text"} id={"ip"} name={"ip"} required size={"25"}
                           onChange={e => inputChanged(e.target.value)}/>
                    <br/><br/>
                    <button type={"submit"}>Submit</button>
                </form>
            </div>
        )
    }
    if (completionState === "Completed") {
        return (<Redirect href={"/"}/>)
    }


}