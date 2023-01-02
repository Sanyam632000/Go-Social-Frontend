import React,{useRef} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { BrowserRouter as Router,Routes, Route,Link,Navigate,useNavigate } from "react-router-dom"
import './App.css';



const Signup =()=>{

    const username = useRef();
    const email = useRef();
    const password = useRef();
    const passwordAgain = useRef();
    const history = useNavigate();
  
    //OnClick Sign Up Button
    const handleClick= async(e)=>{
      e.preventDefault();
      if(password.current.value !== passwordAgain.current.value){
        passwordAgain.current.setCustomValidity("Password don't match... Please try again...")
      }
      else{
        const user={
          username:username.current.value,
          email:email.current.value,
          password:password.current.value
        }
  
        try{
          await axios.post("http://localhost:3030/registers",user);
          console.log("New User is Added...")
          history("/login")
        }
        catch(err){
          console.log(err)
        }
  
      }
    }
  
    return<>
            <div className="bigScreenLogin">
  
              <div>
              <h1>GoSocial</h1>
              <h3 className="login_page_h3">Connect with friends and the World around you on GoSocial.</h3>
              </div>
              
                <div className="mainSignup">
                  <form onSubmit={handleClick}>
                    <h2>GoSocial</h2>
                    <label>UserName</label>
                    <input type="text" placeholder="UserName" minLength={6} ref={username} className="email_input" required/>
                    <label>Email</label>
                    <input type="email" placeholder="Email" ref={email} className="email_input" required/>
                    <label>Password</label>
                    <input type="password" placeholder="Password" ref={password} minLength={6} className="email_input" required/>
                    <label>Password Again</label>
                    <input type="password" placeholder="Password Again" ref={passwordAgain} className="email_input" /> 
                    <button className="btn btn-success login_button signup_button">Sign Up</button>
                    <button className="btn btn--outline already_account"> <Link to='/login' className="link_already_account">Already have an account</Link></button>
                  </form>
                </div>
            </div>
          </>
  }

  export default Signup