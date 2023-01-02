import React,{useRef, useContext} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { BrowserRouter as Router,Routes, Route,Link,Navigate,useNavigate } from "react-router-dom"
import './App.css';
import { loginCall } from "./apiCall.js";


const Login =()=>{

    const email = useRef();
    const password = useRef();
    const {user_detail,isFetching,error,dispatch} = useContext(AuthContext);
    
  
      //OnClick Login Button
      const handleClick =(e) =>{
        e.preventDefault();  
        loginCall({email:email.current.value ,password:password.current.value},dispatch)
        
      }
    
    return<>
            <div className="bigScreenLogin">
              <div>
              <h1>GoSocial</h1>
              <h3 className="login_page_h3">Connect with friends and the World around you on GoSocial.</h3>
              </div>
              
                <div className="mainLogin">
                  <form onSubmit={handleClick}>
                    <h2>GoSocial</h2>
                    <label>Email</label>
                    <input type="email" placeholder="Email" className="email_input" required ref={email}/>
                    <label>Password</label>
                    <input type="password" placeholder="Password" minLength="6"  className="email_input" required ref={password}/>
                    <button className="btn btn-primary login_button">{isFetching? "Loading" :"Login"}</button>
                    <button className="btn btn--outline forget_password_button">Forget Password?</button>
                    <button className="btn btn-success create_new_account"><Link to='/signup' className="link_create_account">Create New Account</Link></button>
                  </form>
                </div>
            </div>
          </>
  }

  export default Login;