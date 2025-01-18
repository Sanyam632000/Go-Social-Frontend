import React,{useState,useEffect, useRef, useContext} from "react";
import {FaUserAlt,FaBookmark,FaQuestion,FaGraduationCap} from "react-icons/fa"
import {MdMessage,MdNotifications,MdOutlineRssFeed,MdOutlineChatBubble,MdVideocam,MdOutlineGroups,MdWorkOutline,MdEventBusy,MdPhotoSizeSelectActual,MdLocationPin,MdOutlineEmojiEmotions} from "react-icons/md"
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router,Routes, Route,Link,Navigate,useNavigate } from "react-router-dom"
import ad from './ad.png'
import axios from "axios";
import {format} from "timeago.js"
import { useParams } from "react-router-dom";
import './App.css';
import { AuthContext } from "./AuthContext";
import {BsThreeDots} from "react-icons/bs"


const Profile =() =>{

    let {_id} = useParams()
    const [file,setFile] = useState(null)
    const {user_detail,dispatch} = useContext(AuthContext);
    const [allUsers,setAllUsers] = useState([]);
    const account_profile_pic = user_detail.profilePicture;
    const [profile_pic,setProfile_pic] = useState();
    const description = useRef();
    const [userdescription,setUserDescription] = useState();
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
        console.log(res.data)
        setUser(res.data)    
        const res_2 = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${_id}`) 
        console.log(res_2.data)
        const profile_picture = res_2.data[0].profilePicture
        const desc = res_2.data[0].description
        const name = res_2.data[0].username      
        setUsername(name)
        setProfile_pic(profile_picture)
        setUserDescription(desc)     
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
          <h6 className="profileImg_desc">{userdescription}</h6>
          <button className={isfollow?"follow-button":"unfollow-button"} onClick={follow_unfollow}>{isfollow?"UnFollow":"Follow"}</button>
          <button className={canEdit?"unfollow-button":"no-edit-button"}>Edit Profile</button>
        </div>
  
          {/*<div className="what_in_mind">
            <img src={account_profile_pic} className="what_in_mind_img"/>
            <textarea maxLength={200} placeholder="What's in your mind?" ></textarea>
          
              <div className="div">
                <button className="what_in_mind_button"><MdPhotoSizeSelectActual/> Photos</button>
                <button className="what_in_mind_button"><MdLocationPin/> Location</button>
                <button className="what_in_mind_button"><MdOutlineEmojiEmotions/> Feeling</button>
                <button className="what_in_mind_button">Share</button>
              </div>
  
      </div>*/}

<form className="what_in_mind" onSubmit={submitHandler}>                                 {/*div what_in_mind starts inside blue*/}
                  
                  <div className="trail">
                    <div className="blue_div_1">
                    <Link to={`/profile/${_id}`}><img src={account_profile_pic} className="what_in_mind_img"/></Link>
                  <textarea maxLength={200}  placeholder="What's in your mind?" ref={description} ></textarea>
                    </div>
                       
                      
                              
                  
                  <div className="div">     
    
                    <label htmlFor="file-upload" className="what_in_mind_button custom-file-upload">
                    <MdPhotoSizeSelectActual/> Photos
                    </label>
                    <input type="file" style={{display:"none"}} id="file-upload"  accept=".png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} className="what_in_mind_button"></input>
                    <button className="what_in_mind_button"><MdLocationPin/> Location</button>
                    <button className="what_in_mind_button"><MdOutlineEmojiEmotions/> Feeling</button>
                    <button className="what_in_mind_button share_button" type="submit">Share</button>
    
                    </div>
                  </div>
    
                </form>  
  
            
  
  
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
  
const RightBar =({profilePicture,username,_id})=>{
    return<>
         <button className="feed"><Link to={`/profile/${_id}`} className="link_3"> <img src={profilePicture} className="all_other"/> {username} </Link></button>
          </>
  }
  
const EndBar =({profilePicture,username,_id})=>{ 
    return<>
            <button className="feed green_button"><Link to={`/profile/${_id}`} className="link_3"> <img src={profilePicture} className="all_other"/> {username} </Link></button>
          </>
  
  }

  const Post =({description,img,userId,updatedAt}) =>{

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
       <img src={img?"${process.env.REACT_APP_BACKEND_URL}/image/"+img:""} className={img?"post_image":"no_image"}></img> 
                
     </div>

        </>
}

export default Profile