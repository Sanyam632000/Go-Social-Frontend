import React,{useState,useEffect, useRef, useContext} from "react";
import {FaUserAlt,FaBookmark,FaQuestion,FaGraduationCap} from "react-icons/fa"
import {MdMessage,MdNotifications,MdOutlineRssFeed,MdOutlineChatBubble,MdVideocam,MdOutlineGroups,MdWorkOutline,MdEventBusy,MdPhotoSizeSelectActual,MdLocationPin,MdOutlineEmojiEmotions} from "react-icons/md"
import {BsThreeDots} from "react-icons/bs"
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router,Routes, Route,Link,Navigate,useNavigate } from "react-router-dom"
import ad from './ad.png'
import axios from "axios";
import {format} from "timeago.js"
import { useParams } from "react-router-dom";
import './App.css';
import { loginCall } from "./apiCall";
import { AuthContext } from "./AuthContext";
import {io} from "socket.io-client"
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";




function App() {
  const {user_detail} = useContext(AuthContext);
  return <>
      <Router>       

        <Routes>
           {/*<Route exact path='/' element={user_detail?<Home/>:<Signup/>}>  </Route>*/}
            <Route exact path='/' element={user_detail?<Home/>:<Login/>}>  </Route>
            <Route path='/login' element={user_detail ? <Navigate to='/' />: <Login/>} >  </Route>
            <Route path='/signup' element={user_detail? <Navigate to="/"/> :<Signup/>}>  </Route>
            <Route path='/profile/:_id' element={<Profile/>}>  </Route>
            <Route path='/messenger' element={<Messenger/>}>  </Route>
        </Routes>

    </Router>
         </>  
}


const ChatFriends =({members})=>{ 

  const {user_detail} = useContext(AuthContext)
  const id = user_detail._id 
  const [chatter_profile_pic,setChatter_Profile_Pic] = useState()
  const [username,setUsername] = useState()


   useEffect(() =>{
    const fetchFriendId =async()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/conversation/${id}`)
      const len = res.data.length

        for(var i=0;i<len;i++){
          for(var j=0;j<2;j++) {
            if(members[j] !== id){
              const res_2 = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${members[j]}`)
              setChatter_Profile_Pic(res_2.data[i].profilePicture)
              setUsername(res_2.data[i].username)
            }
          }
        }  
      }  

    fetchFriendId()
   },[id])
    
  return<>
         <button className="feed green_button" ><img src={chatter_profile_pic} className="all_other"/> {username}</button>
        </>
}


const Message_Syntax =({text,senderId})=>{
  const {user_detail} = useContext(AuthContext)
  const profile_img = user_detail.profilePicture
  const id = user_detail._id

    
  return<>
          <div className={(senderId!==id)?"messages":"messages_right"}>
              <img src={profile_img} className="img_message_part"></img>
              <h6 className={(senderId==id)?"message_text_right":"message_text"}>{text}</h6> 
          </div>
        </>
}




const Messenger=()=>{
  
  const {user_detail} = useContext(AuthContext)
  const id = user_detail._id;
  const profile_img = user_detail.profilePicture
  const text = useRef();
  const scrollRef = useRef();
  const [friendsChatter,setFriendsChatter] = useState()
  const [conversation,setConversation] = useState([]);
  const [chatter_pic,setChatter_Pic] = useState()
  const [chatter_name,setChatter_Name] = useState()
  const [chatter_id,setChatter_Id] = useState()
  const [currentChat,setCurrentChat] = useState("")
  const [message,setMessage] = useState([])
  let [notifications,setNotifications] = useState(0)

  useEffect(() =>{
    const getConversation =async()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/conversation/${id}`)
      setConversation(res.data)
     // const len = conversation.length   
     // console.log(res.data) 
    }

    getConversation()
  },[id])

  
  useEffect(() => {
    const fetchMessages =async()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/message/getMessage/${currentChat._id}`) 
      setMessage(res.data)

      for(let i=0;i<2;i++){
        if(currentChat.members[i] !== id){
          const res_2 = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${currentChat.members[i]}`)
          setChatter_Name(res_2.data[0].username)
          setChatter_Pic(res_2.data[0].profilePicture)
          setChatter_Id(res_2.data[0]._id)  
        }
      }
    }

    fetchMessages();
  },[currentChat])
 
  //Get Friends
  useEffect(() => {
    const fetchUserFollowing =async()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${id}/getfollowing`) 
      setFriendsChatter(res.data)   
    }
    fetchUserFollowing();
  },[id])

  //OnClick Send Button for messenger...;
  const sendText =async(e) =>{
    e.preventDefault();
   
    const newMessage ={
      chatId:  currentChat._id ,
      senderId: user_detail._id,
      text:text.current.value
    }

    socket.current.emit("sendMessage", {
      userId: user_detail._id,
      receiverId: currentChat.members.find(member => member !== user_detail._id),
      text: text.current.value   
    })

    

    socket.current.emit("sendNotification",{
      userId: user_detail._id,
      receiverId:currentChat.members.find(member => member !== user_detail._id),
      notification:notifications++ 
    })
    console.log(notifications)

    try{
      const res = await axios.post("${process.env.REACT_APP_BACKEND_URL}/message/",newMessage);    
      setMessage([...message,res.data]) ;  
      text.current.value=""     
   }
   catch(err){} 

  }


  useEffect(() => {
    scrollRef.current?.scrollIntoView({behavior:"smooth"})
  },[message])
 

  //Socket Start and one function of socket in sendText function
  const socket = useRef()
  const [arrivalMessage,setArrivalMessage] = useState(null);


  useEffect(() => {
    socket.current = io("localhost:8900")
    socket.current.on("getMessage", data => {
      setArrivalMessage({
        chatId:  currentChat._id ,
        senderId: data.userId,
        text: data.text
      })
    })

    socket.current.on("getNotification", data => {
      setNotifications(prev => [...prev,data])
    })

  },[socket])


  useEffect(() => {
    arrivalMessage && currentChat.members.includes(arrivalMessage.senderId) && setMessage((prev) => [...prev,arrivalMessage])
  },[arrivalMessage,currentChat])


  useEffect(() =>{
    socket.current.emit("addUser", user_detail._id)
  },[user_detail])

  
  return<>
   <div className='containe'> 

   <div className='header'>
    <h1 className='h1left'> GoSocial </h1>
      <input type="text" placeholder="  Search for friend, post or video"/> 

      <ul> 
          <li className='first'><Link to="/" className='link'>HomePage</Link></li>
          <li><Link to="/" className='link'>TimeLine</Link></li>
          <li><Link to="/" className='link'><FaUserAlt fontSize={20}/><span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span></Link></li>
          <li><Link to="/" className='link'><MdMessage fontSize={20}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
          <li><Link to="/" className='link'><MdNotifications fontSize={25}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
          <li><Link to={`/profile/${id}`}><img src={profile_img} className="header_image"></img></Link></li>
          
    </ul> 

    </div>


    <div id="main">                                                                          


            <div className='red messenger-red' >                                                                  
              <div className="chatters-header">
                  <h3 className="chatters-header-part">MY FRIENDS</h3>

                    {conversation.map((c) => {
                      return<>
                        <div onClick={()=>setCurrentChat(c)}>
                          <ChatFriends key={c._id} {...c}/>
                        </div>
                        </>
                    })}   
              
              </div>
            </div>                                                                                    



          <div className='blue message-part '>      
           

            <div className="messenger-blue">
                  <div className="chat-messge-header">
                  <button className="feed green_button receiver-chat-header"><Link to="/" className="link_3"> <img src={chatter_pic} className="all_other"/> {chatter_name} </Link></button>
                  <hr/>
                  </div>

                  {currentChat?<>{message.map((msg) => {
                          return(
                            <div ref={scrollRef}>
                              <Message_Syntax key={msg._id} {...msg} />
                            </div>
                          )
                        })}</>:<h1>No Chats</h1>} 

                      
            </div>
            
              <form className="do_messages" onSubmit={sendText}>
                  <textarea className="type_message" ref={text} placeholder="Write something..."></textarea>
                  <button className="btn send_message_button">Send</button>
              </form> 

          </div>                                                                                       



          <div className='green'>  
            
            <div className="receiver-info">
             <img src={chatter_pic} className="receiver-img"></img>
              <Link to={`/profile/${chatter_id}`}><button><h3 className="receiver-name">{chatter_name}</h3></button></Link>
            </div>                                                     

          </div>                                                                                      


  </div> 
  </div>       
        </>
}


export default App;





/*const Home =() =>{

  const [posts,setPosts] = useState([]);
  const {user_detail} = useContext(AuthContext);
  const description = useRef();
  const [file,setFile] = useState(null)
  const id = user_detail._id;
  const profile_img = user_detail.profilePicture;
  const [user,setUser] = useState([]);
  const [allUsers,setAllUsers] = useState([]); 

  //Here in useEffect, fetchPost method store posts of send userid(in axios) in post array...It uses axios method to use postman method...
  useEffect(() => {
    const fetchPost = async() =>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/post/timeline/${id}`);
  //arrange post in ascending order according to time...
      setPosts(res.data.sort((p1,p2) =>{
      return new Date(p2.updatedAt) - new Date(p1.updatedAt)
    }))  
    }
    fetchPost();
  },[])


  //Get Friends of the user
  useEffect(() => {
    const fetchUserFollowing =async()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${id}/getfollowing`) 
      setUser(res.data)   
    }
    fetchUserFollowing();
  },[])


  //Get All the user in mongo database...
  useEffect(() => {
    const fetchAllUsers = async() =>{
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/get_all_users")
      setAllUsers(res.data)
    }
    fetchAllUsers();
  },[])


  //On Click Share Button...
   const submitHandler =async(e)=>{
     e.preventDefault();
    
     const newPost ={
       userId: user_detail._id,
       description:description.current.value
     }

     if(file){
       const data = new FormData();
       const fileName = file.name
       data.append("file",file)
       data.append("name",fileName)   
       newPost.img = fileName
      
       try{ 
          await axios.post("${process.env.REACT_APP_BACKEND_URL}/post/upload",data)
          
       }catch(err){}
     }

     try{
        await axios.post("${process.env.REACT_APP_BACKEND_URL}/post/create",newPost)   
       
        window.location.reload()
       
     }
     catch(err){}
   }

  return(
    
    <div className='containe'>    

        <div className='header'>

          <h1 className='h1left'> Go-Social </h1>
          <input type="text" placeholder="  Search for friend, post or video"/>   
              <ul> 
                <li className='first'><Link to="/" className='link'>HomePage</Link></li>
                <li><Link to="/" className='link'>TimeLine</Link></li>
                <li><Link to="/" className='link'><FaUserAlt fontSize={20}/><span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span></Link></li>
                <li><Link to="/messenger" className='link'><MdMessage fontSize={20}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
                <li><Link to="/" className='link'><MdNotifications fontSize={25}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
                <li><Link to={`/profile/${id}`}><img src={profile_img} className="header_image"></img></Link></li>
            </ul> 

        </div>   */                                                                                 {/*div header end*/}

     /*   <div id="main">       */                                                                     {/*div with id main starts*/}

       /*    <div className='red' >         */                                                         {/*div red starts*/}

        /*    <ul>
              <button className="feed"><Link to='/' className="link_2 leftbar_profile_name"> <img src={user_detail.profilePicture} className="leftbar_profile_pic"></img> {user_detail.username} </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <MdOutlineChatBubble/> Chat </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <MdVideocam/> Video </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <MdOutlineGroups/> Groups </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <FaBookmark/> Bookmarks </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <FaQuestion/> Questions </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <MdWorkOutline/> Jobs </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <MdEventBusy/> Events </Link></button>
              <button className="feed"><Link to='/' className="link_2"> <FaGraduationCap/> Courses </Link></button>
            </ul>
            
              <button className="btn-outline">Show More</button>
              <hr/>

                <ul>   
                  {allUsers.map((person) =>{
                    return(
                        <RightBar key={person._id} {...person}/>
                    )
                  })}          
                </ul>

          </div>              */                                                                      {/*div red ends*/}


      /*    <div className='blue'>          */                                                           {/*div blue starts*/}

        /*    <form className="what_in_mind" onSubmit={submitHandler}>           */                      {/*div what_in_mind starts inside blue*/}

          /*    <Link to={`/profile/${id}`}><img src={profile_img} className="what_in_mind_img"/></Link>
              <textarea maxLength={200} ref={description} placeholder="What's in your mind?" ></textarea>              
              
              <div className="div">     

                <label htmlFor="file-upload" className="what_in_mind_button custom-file-upload">
                <MdPhotoSizeSelectActual/> Photos
                </label>
                <input type="file" style={{display:"none"}} id="file-upload"  accept=".png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} className="what_in_mind_button"></input>
                <button className="what_in_mind_button"><MdLocationPin/> Location</button>
                <button className="what_in_mind_button"><MdOutlineEmojiEmotions/> Feeling</button>
                <button className="what_in_mind_button share_button" type="submit">Share</button>

              </div>

            </form>           */                                                                         {/*div what_in_mind ends*/}

         /*     {posts.map((post) =>{
                    return(
                      <Post key={post._id} {...post}/>
                    )
                  })} 
                  
          </div>        */                                                                                {/*div blue ends*/}


       /*   <div className='green' >        */                                                              {/*div green starts*/}

         /*   <h3 className="endbar_heading"> <b>Pola</b> and <b>3 other</b> have a birthday today.</h3>
            <img src={ad} className="ad_image"></img>
            <hr className="green_hr"/>
            <h5 className="green_h5"> Friends</h5>

              {user.map((u) => {
                      return(
                        <EndBar key={u._id} {...u}/>
                      )
                    })} 

          </div>     */                                                                                   {/*div green ends*/}
          
    /*    </div>        */                                                                                   {/*div id main ends*/}   
  
  /*  </div> 
  )
}*/


/*const RightBar =({profilePicture,username,_id})=>{
  return<>
       <button className="feed"><Link to={`/profile/${_id}`} className="link_3"> <img src={profilePicture} className="all_other"/> {username} </Link></button>
        </>
}

const EndBar =({profilePicture,username,_id})=>{ 
  return<>
          <button className="feed green_button"><Link to={`/profile/${_id}`} className="link_3"> <img src={profilePicture} className="all_other"/> {username} </Link></button>
        </>

}*/


/*const Post =({description,img,userId,updatedAt}) =>{

    //Here, useEffect get the user in axios method and is used accordingly...
    const [user,setUser] = useState([]);

    useEffect(() => {
      const fetchUser =async()=>{
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${userId}`)  
        setUser(res.data[0])
        
      }
      
      fetchUser();
    },[])
 
   return<>

     <div className="post">

       <div className="post_2"> 
         <Link to={`/profile/${user._id}`}><img src={user.profilePicture} className="post_profilePicture"/></Link>
           <div>
             <Link to={`/profile/${user._id}`} className="link" ><h5 className="post_profileName">{user.username}</h5></Link>
             <h6 className="post_time">{format(updatedAt)}</h6>
             <button className="three_dot_button"><BsThreeDots className="threedot"/></button>
           </div>
       </div> 
               
       <h3 className="post_description">{description}</h3>
       <img src={img?"${process.env.REACT_APP_BACKEND_URL}/images/"+img:""} className={img?"post_image":"no_image"}></img> 
                
     </div>

        </>
}


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
                  <input type="email" placeholder="Email"  className="email_input" required ref={email}/>
                  <label>Password</label>
                  <input type="password" placeholder="Password"  minLength="6"  className="email_input" required ref={password}/>
                  <button className="btn btn-primary login_button">{isFetching? "Loading" :"Login"}</button>
                  <button className="btn btn--outline forget_password_button">Forget Password?</button>
                  <button className="btn btn-success create_new_account"><Link to='/signup' className="link_create_account">Create New Account</Link></button>
                </form>
              </div>
          </div>
        </>
}


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
        await axios.post("${process.env.REACT_APP_BACKEND_URL}/registers",user);
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




const Profile =() =>{

  let {_id} = useParams()
  const {user_detail,dispatch} = useContext(AuthContext);
  const [allUsers,setAllUsers] = useState([]);
  const account_profile_pic = user_detail.profilePicture;
  const [profile_pic,setProfile_pic] = useState();
  const [description,setDescription] = useState();
  const [username,setUsername] = useState();
  const [user,setUser] = useState([]);
  const [mypost,setMypost] = useState([]);
  const [isfollow,setisFollow] = useState(user_detail.following.includes(_id));
  const [canEdit,setCanEdit] = useState(false)


  useEffect(() => {
    const fetchAllUsers = async() =>{
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/get_all_users")
      setAllUsers(res.data)
    }

    fetchAllUsers();
  },[])
  

  useEffect(() => {  
    const fetchUserFollowing =async()=>{ 
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${_id}/getfollowing`) 
      setUser(res.data)    
      const res_2 = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${_id}`) 
      const profile_picture = res_2.data[0].profilePicture
      const desc = res_2.data[0].description
      const name = res_2.data[0].username      
      setUsername(name)
      setProfile_pic(profile_picture)
      setDescription(desc)     
    }

    fetchUserFollowing();
  },[_id])
  

  useEffect(() => {
    const fetchMyPost =async()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/post/user/${_id}`) 
      setMypost(res.data.sort((p1,p2) =>{
        return new Date(p2.updatedAt) - new Date(p1.updatedAt)
      }))
    }

    fetchMyPost();
  },[_id])
  

  //OnClick follow Button
  const follow_unfollow = async() =>{
    
    console.log(isfollow)
    try{
      if(isfollow){
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/${_id}/unfollow`,{userId:user_detail._id})
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/conversation/${user_detail._id}/${_id}`)
        dispatch({type:"UNFOLLOW",payload: user._id})
        
      }
      else{
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/${_id}/follow`,{userId:user_detail._id})

        const newConversation ={
          senderId:user_detail._id,
          receiverId: _id
        }
        console.log(newConversation)
        const res = await axios.post("${process.env.REACT_APP_BACKEND_URL}/conversation/",newConversation)    
        dispatch({type:"FOLLOW",payload: user._id})
      }
      setisFollow(!isfollow)   
    }
    catch(err){
    }

  }


  useEffect(() => {
    const edit_profile =()=>{
      if(user_detail._id === _id){
        setCanEdit(true)     
      }
    }
      edit_profile()
  },[])


  return(
    <div className='containe'>
    <div className='header'>
      
      <h1 className='h1left'><Link to='/' className="link"> GoSocial </Link></h1>
      <input type="text" placeholder="  Search for friend, post or video"/> 
      
      <ul> 
          <li className='first'><Link to="/" className='link'>HomePage</Link></li>
          <li><Link to="/" className='link'>TimeLine</Link></li>
          <li><Link to="/" className='link'><FaUserAlt fontSize={20}/><span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span></Link></li>
          <li><Link to="/messenger" className='link'><MdMessage fontSize={20}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
          <li><Link to="/" className='link'><MdNotifications fontSize={25}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
          <li><img src={account_profile_pic} className="header_image"></img></li>
    </ul> 

  </div>

  <div id="main">

    <div className='red' >

      <ul>
      <button className="feed"><Link to='/' className="link_2"> <MdOutlineRssFeed/> Feed </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <MdOutlineChatBubble/> Chat </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <MdVideocam/> Video </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <MdOutlineGroups/> Groups </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <FaBookmark/> Bookmarks </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <FaQuestion/> Questions </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <MdWorkOutline/> Jobs </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <MdEventBusy/> Events </Link></button>
      <button className="feed"><Link to='/' className="link_2"> <FaGraduationCap/> Courses </Link></button>
      </ul>

      <button className="btn-outline">Show More</button>
      <hr/>

      <ul> 
      {allUsers.map((person) =>{
        return(
            <RightBar key={person._id} {...person}/>
        )
      })}          
      </ul>

    </div>


    <div className='blue'>

      <div className="for_profile">
        <img src ="https://raw.githubusercontent.com/safak/youtube/react-social-ui/public/assets/post/3.jpeg" className="coverImg"/>
        <img src ={profile_pic} className="profileImg"/>
        <h2 className="profileImg_Name">{username}</h2>
        <h6 className="profileImg_desc">{description}</h6>
        <button className={isfollow?"follow-button":"unfollow-button"} onClick={follow_unfollow}>{isfollow?"UnFollow":"Follow"}</button>
        <button className={canEdit?"unfollow-button":"no-edit-button"}>Edit Profile</button>
      </div>

        <div className="what_in_mind">
          <img src={account_profile_pic} className="what_in_mind_img"/>
          <textarea maxLength={200} placeholder="What's in your mind?" ></textarea>
        
            <div className="div">
              <button className="what_in_mind_button"><MdPhotoSizeSelectActual/> Photos</button>
              <button className="what_in_mind_button"><MdLocationPin/> Location</button>
              <button className="what_in_mind_button"><MdOutlineEmojiEmotions/> Feeling</button>
              <button className="what_in_mind_button">Share</button>
            </div>

        </div>

          


        {mypost.map((post) =>{
          return(
            <Post key={post._id} {...post}/>
          )
        })}  

    </div>  


    <div className='green' >
      <h3 className="endbar_heading"> <b>Pola</b> and <b>3 other</b> have a birthday today.</h3>
      <img src={ad} className="ad_image"></img>
      <hr className="green_hr"/>
      <h5 className="green_h5"> Friends</h5>

      

      {user.map((u) => {
          return(
            <EndBar key={u._id} {...u}/>
          )
        })} 

    </div>
    
  </div>
  
</div>
  )
}
*/

