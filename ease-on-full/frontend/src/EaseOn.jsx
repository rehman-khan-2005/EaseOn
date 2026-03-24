import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   EASE-ON — Community Wellness App Prototype
   Enhanced DM + Top Contributor Features
   ═══════════════════════════════════════════════════════════════════ */

const T = {
  bg: "#0e1117", surface: "#161b22", card: "#1c2129", raised: "#242b35",
  accent: "#3fb8a0", accentDark: "#2d9480", accentGlow: "rgba(63,184,160,0.15)",
  text: "#f0f2f5", textSec: "#8b949e", textDim: "#484f58",
  border: "#21262d", danger: "#f85149", gold: "#f1c40f", silver: "#bdc3c7", bronze: "#cd7f32",
};

const MOODS = [
  { emoji: "😢", label: "Awful", value: 1, color: "#f85149" },
  { emoji: "😞", label: "Bad", value: 2, color: "#d29922" },
  { emoji: "😐", label: "Okay", value: 3, color: "#e3b341" },
  { emoji: "🙂", label: "Good", value: 4, color: "#3fb950" },
  { emoji: "😁", label: "Great", value: 5, color: "#3fb8a0" },
];

const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

// ─── All platform users (simulated DB) ─────────────────────────────
const ALL_USERS = [
  { id: "u1", name: "Alex M.", username: "alexm", avatar: "🧑‍💻", karma: 142, bio: "Mindfulness advocate. 30-day streak and counting.", online: true },
  { id: "u2", name: "Jordan L.", username: "jordanl", avatar: "🧑‍🎨", bio: "Finding light in the everyday.", karma: 98, online: true },
  { id: "u3", name: "Sam K.", username: "samk", avatar: "🧑‍🔬", bio: "Box breathing changed my life.", karma: 67, online: false },
  { id: "u4", name: "Maya R.", username: "mayar", avatar: "👩‍🏫", bio: "Therapist-in-training. Here to listen.", karma: 205, online: true },
  { id: "u5", name: "Chris T.", username: "christ", avatar: "🧑‍🎤", bio: "Music heals.", karma: 54, online: false },
  { id: "u6", name: "Priya D.", username: "priyad", avatar: "👩‍💻", bio: "Journaling daily for 100 days.", karma: 180, online: true },
  { id: "u7", name: "Leo W.", username: "leow", avatar: "🧑‍🍳", bio: "Cooking is my therapy.", karma: 43, online: false },
  { id: "u8", name: "Nina S.", username: "ninas", avatar: "👩‍🎨", bio: "Art therapy believer.", karma: 120, online: true },
];

const CIRCLES_INIT = [
  { id: 1, name: "Recover", tag: "#Recover", members: 815, desc: "A safe space for those in recovery.", vis: "public" },
  { id: 2, name: "Depression", tag: "#Depression", members: 503, desc: "Support for those experiencing depression.", vis: "public" },
  { id: 3, name: "Anxiety Warriors", tag: "#AnxietyWarriors", members: 672, desc: "Coping strategies for anxiety.", vis: "public" },
  { id: 4, name: "Mindfulness", tag: "#Mindfulness", members: 340, desc: "Meditation and being present.", vis: "public" },
];

const POSTS_INIT = [
  { id: "p1", userId: "u1", username: "alexm", avatar: "🧑‍💻", circle: "#Recover", text: "Day 30 of my mindfulness journey. It's getting easier to pause before reacting.", mood: 4, time: "2h ago", likes: 12, comments: 3 },
  { id: "p2", userId: "u2", username: "jordanl", avatar: "🧑‍🎨", circle: "#Depression", text: "Had a rough morning but went for a walk and it helped a lot. Small wins.", mood: 3, time: "4h ago", likes: 24, comments: 7 },
  { id: "p3", userId: "u3", username: "samk", avatar: "🧑‍🔬", circle: "#Mindfulness", text: "Box breathing — 4 in, 4 hold, 4 out, 4 hold. Game changer.", mood: 5, time: "6h ago", likes: 31, comments: 5 },
  { id: "p4", userId: "u4", username: "mayar", avatar: "👩‍🏫", circle: "#Recover", text: "Remember: healing isn't linear. Be kind to yourselves today.", mood: 4, time: "8h ago", likes: 56, comments: 12 },
];

// ─── SVG Icons ──────────────────────────────────────────────────────
const Ic = {
  Home: ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?T.accent:"none"} stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Compass: ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  Book: ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?T.accent:"none"} stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Search: ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Heart: ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?T.accent:"none"} stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Back: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  Plus: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Bell: ({dot}) => <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>{dot&&<span style={sty.dot}/>}</>,
  Msg: ({dot}) => <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{dot&&<span style={{...sty.dot,right:-2}}/>}</>,
  Like: ({on}) => <svg width="16" height="16" viewBox="0 0 24 24" fill={on?T.accent:"none"} stroke={on?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
  Chat: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill={T.gold} stroke={T.gold} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trophy: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
  Compose: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  Online: () => <div style={{width:8,height:8,borderRadius:4,background:"#3fb950",border:`2px solid ${T.card}`}}/>,
};

// ─── Shared Components ──────────────────────────────────────────────
const Pill = ({children,active,onClick,style:x}) => <button onClick={onClick} style={{padding:"8px 20px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s",fontFamily:"inherit",background:active?T.accent:T.raised,color:active?"#fff":T.textSec,...x}}>{children}</button>;
const StatCard = ({value,label}) => <div style={{...sty.card,flex:1,textAlign:"center",padding:"14px 6px",minWidth:0}}><div style={{fontSize:26,fontWeight:800,color:T.text,fontFamily:"'Outfit',sans-serif",lineHeight:1}}>{value}</div><div style={{fontSize:10,color:T.textSec,marginTop:6}}>{label}</div></div>;
const TopBar = ({left,title,right,titleColor}) => <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,minHeight:32}}><div style={{display:"flex",alignItems:"center",gap:10}}>{left}{title&&<h2 style={{fontSize:20,fontWeight:700,color:titleColor||T.text,margin:0,fontFamily:"'Outfit',sans-serif"}}>{title}</h2>}</div><div style={{display:"flex",alignItems:"center",gap:8}}>{right}</div></div>;
const MoodRow = ({selected,onSelect,size=30}) => <div style={{display:"flex",justifyContent:"space-around",padding:"4px 0"}}>{MOODS.map(m=><button key={m.value} onClick={()=>onSelect(m)} style={{background:"none",border:selected===m.value?`2px solid ${m.color}`:"2px solid transparent",borderRadius:14,padding:5,cursor:"pointer",transition:"all .15s",transform:selected===m.value?"scale(1.2)":"scale(1)",opacity:selected&&selected!==m.value?0.4:1}}><span style={{fontSize:size}}>{m.emoji}</span></button>)}</div>;

// ═══════════════════════════════════════════════════════════════════
export default function EaseOn() {
  const [screen,setScreen]=useState("home");
  const [navHist,setNavHist]=useState([]);
  const [tab,setTab]=useState("home");

  const [loggedIn,setLoggedIn]=useState(false);
  const [regMode,setRegMode]=useState(false);
  const [loginForm,setLoginForm]=useState({email:"",pw:""});
  const [regForm,setRegForm]=useState({name:"",user:"",email:"",pw:""});

  const [user,setUser]=useState({name:"Sarah",username:"sarah10",avatar:"😊",email:"sarah@example.com",phone:"000-000-0000",anonymous:false,karma:48,daysActive:48,postsCreated:2});
  const [todayMood,setTodayMood]=useState(null);
  const [moodLog,setMoodLog]=useState([{date:new Date(2026,2,16),value:3},{date:new Date(2026,2,17),value:4},{date:new Date(2026,2,18),value:2},{date:new Date(2026,2,19),value:5},{date:new Date(2026,2,20),value:4},{date:new Date(2026,2,21),value:3}]);
  const [moodCounts,setMoodCounts]=useState({1:0,2:1,3:2,4:2,5:1});
  const [streak,setStreak]=useState(2);

  const [journals,setJournals]=useState([
    {id:1,date:new Date(2026,2,20,8,41),text:"It was a pretty average day. I went to work and school... nothing too exciting.",mood:3,vis:"private"},
    {id:2,date:new Date(2026,2,22,17,53),text:"I passed all of my exams so far, I feel fantastic!!",mood:5,vis:"private"},
    {id:3,date:new Date(2026,1,15,21,20),text:"It rained all day. I got soaked.",mood:2,vis:"private"},
    {id:4,date:new Date(2026,1,12,4,30),text:"I have a presentation in the morning. I don't know if I'm ready and this has been stressing me out so much.",mood:1,vis:"private"},
  ]);
  const [editJ,setEditJ]=useState(null);
  const [jText,setJText]=useState("");
  const [jMood,setJMood]=useState(null);

  const [circles,setCircles]=useState(CIRCLES_INIT);
  const [joined,setJoined]=useState([1,2]);
  const [selCircle,setSelCircle]=useState(null);
  const [showCreateCircle,setShowCreateCircle]=useState(false);
  const [newCircleName,setNewCircleName]=useState("");
  const [newCircleDesc,setNewCircleDesc]=useState("");

  const [posts,setPosts]=useState(POSTS_INIT);
  const [liked,setLiked]=useState(new Set());
  const [newPostText,setNewPostText]=useState("");
  const [newPostCircle,setNewPostCircle]=useState("");
  const [newPostMood,setNewPostMood]=useState(null);
  const [newPostAud,setNewPostAud]=useState("public");

  // ─── Enhanced DM State ────────────────────────────────────────────
  const [convos,setConvos]=useState([
    {userId:"u4",msgs:[
      {from:"u4",text:"Hi Sarah! I noticed you've been consistent with your check-ins. That takes real discipline. 💪",time:"9:00 AM",date:"Today"},
      {from:"me",text:"Thanks Maya! Your posts in #Recover are really helpful too.",time:"9:15 AM",date:"Today"},
      {from:"u4",text:"That means a lot. If you ever want to chat about anything, I'm here.",time:"9:20 AM",date:"Today"},
    ]},
    {userId:"u1",msgs:[
      {from:"u1",text:"Hey! Saw your post about mindfulness. Really inspiring!",time:"10:30 AM",date:"Yesterday"},
      {from:"me",text:"Thanks Alex! It's been a journey.",time:"10:45 AM",date:"Yesterday"},
      {from:"u1",text:"Would you be interested in co-leading a mindfulness circle?",time:"11:00 AM",date:"Yesterday"},
    ]},
    {userId:"u2",msgs:[
      {from:"u2",text:"Would you like to join our new support circle?",time:"3:00 PM",date:"Mar 20"},
    ]},
    {userId:"u6",msgs:[
      {from:"u6",text:"I saw we have similar journaling streaks! Keep it up 🔥",time:"6:30 PM",date:"Mar 19"},
      {from:"me",text:"Omg yes! 100 days is amazing. Any tips?",time:"6:45 PM",date:"Mar 19"},
      {from:"u6",text:"Consistency over perfection. Even one sentence counts.",time:"7:00 PM",date:"Mar 19"},
    ]},
  ]);
  const [activeChat,setActiveChat]=useState(null);
  const [msgInput,setMsgInput]=useState("");
  const [dmSearch,setDmSearch]=useState("");
  const [showNewDm,setShowNewDm]=useState(false);
  const [viewingProfile,setViewingProfile]=useState(null);

  // ─── Top Contributor state ────────────────────────────────────────
  const [tcTimeRange,setTcTimeRange]=useState("all");

  const [notifs,setNotifs]=useState([
    {id:1,type:"circle_invite",text:"Jordan invited you to #SelfCare",read:false,time:"1h ago"},
    {id:2,type:"new_message",text:"New message from Maya R.",read:false,time:"2h ago"},
    {id:3,type:"karma",text:"You reached 48 karma points! 🎉",read:true,time:"1d ago"},
  ]);
  const [setForm,setSetForm]=useState({...user});
  const [query,setQuery]=useState("");
  const [reminders,setReminders]=useState([{id:1,text:"Log your mood",time:"9:00 AM",on:true},{id:2,text:"Write a reflection",time:"8:00 PM",on:true}]);
  const [groupMsgs,setGroupMsgs]=useState([{from:"u1",text:"Welcome everyone! 👋",time:"3:00 PM"},{from:"u2",text:"Happy to be here!",time:"3:05 PM"}]);
  const [groupInput,setGroupInput]=useState("");

  // Navigation
  const nav=(s)=>{setNavHist(h=>[...h,screen]);setScreen(s)};
  const goBack=()=>{if(navHist.length>0){setNavHist(h=>{const prev=h[h.length-1];setScreen(prev);return h.slice(0,-1)})}else setScreen(tab)};
  const tabNav=(t)=>{setTab(t);setNavHist([]);setScreen(t)};

  // Actions
  const logMood=(m)=>{setTodayMood(m.value);setMoodLog(p=>[...p,{date:new Date(),value:m.value}]);setMoodCounts(p=>({...p,[m.value]:(p[m.value]||0)+1}));setStreak(p=>p+1)};
  const saveJournal=()=>{if(!jText.trim())return;if(editJ){setJournals(p=>p.map(j=>j.id===editJ.id?{...j,text:jText,mood:jMood||j.mood,date:new Date()}:j))}else{setJournals(p=>[{id:Date.now(),date:new Date(),text:jText,mood:jMood||3,vis:"private"},...p])}setJText("");setJMood(null);setEditJ(null);goBack()};
  const createPost=()=>{if(!newPostText.trim())return;setPosts(p=>[{id:"p"+Date.now(),userId:"me",username:user.username,avatar:user.avatar,circle:newPostCircle||"#General",text:newPostText,mood:newPostMood||3,time:"Just now",likes:0,comments:0},...p]);setUser(p=>({...p,postsCreated:p.postsCreated+1,karma:p.karma+2}));setNewPostText("");setNewPostCircle("");setNewPostMood(null);goBack()};
  const toggleLike=(pid)=>{const s=new Set(liked);if(s.has(pid)){s.delete(pid);setPosts(p=>p.map(x=>x.id===pid?{...x,likes:x.likes-1}:x))}else{s.add(pid);setPosts(p=>p.map(x=>x.id===pid?{...x,likes:x.likes+1}:x))}setLiked(s)};

  const sendMsg=()=>{
    if(!msgInput.trim()||!activeChat)return;
    setConvos(p=>p.map(c=>c.userId===activeChat?{...c,msgs:[...c.msgs,{from:"me",text:msgInput,time:fmtTime(new Date()),date:"Today"}]}:c));
    setMsgInput("");
  };

  const startNewDm=(userId)=>{
    if(!convos.find(c=>c.userId===userId)){
      setConvos(p=>[{userId,msgs:[]},...p]);
    }
    setActiveChat(userId);
    setShowNewDm(false);
    setDmSearch("");
    nav("chat");
  };

  const sendGroupMsg=()=>{if(!groupInput.trim())return;setGroupMsgs(p=>[...p,{from:"me",text:groupInput,time:fmtTime(new Date())}]);setGroupInput("")};
  const createCircle=()=>{if(!newCircleName.trim())return;const nc={id:Date.now(),name:newCircleName,tag:"#"+newCircleName.replace(/\s/g,""),members:1,desc:newCircleDesc||"A new circle.",vis:"public"};setCircles(p=>[...p,nc]);setJoined(p=>[...p,nc.id]);setNewCircleName("");setNewCircleDesc("");setShowCreateCircle(false)};
  const saveSettings=()=>{setUser(p=>({...p,name:setForm.name,username:setForm.username,email:setForm.email,phone:setForm.phone,anonymous:setForm.anonymous}));goBack()};

  const unreadCount = convos.reduce((acc,c)=>{
    const lastMsg = c.msgs[c.msgs.length-1];
    return acc + (lastMsg && lastMsg.from !== "me" ? 1 : 0);
  }, 0);

  // ── Post Card ────────────────────────────────────────────────────
  const PostCard=({p})=>(
    <div style={{...sty.card,marginBottom:12,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{...sty.avatarSm,cursor:"pointer"}} onClick={()=>{const u=ALL_USERS.find(x=>x.id===p.userId);if(u){setViewingProfile(u);nav("userProfile")}}}>{p.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <span style={{color:T.text,fontWeight:600,fontSize:13,cursor:"pointer"}} onClick={()=>{const u=ALL_USERS.find(x=>x.id===p.userId);if(u){setViewingProfile(u);nav("userProfile")}}}>{user.anonymous&&p.userId==="me"?"Anonymous":`@${p.username}`}</span>
          <span style={{color:T.textDim,fontSize:11,marginLeft:6}}>{p.circle} · {p.time}</span>
        </div>
        <span style={{fontSize:22}}>{MOODS.find(m=>m.value===p.mood)?.emoji}</span>
      </div>
      <p style={{color:T.text,fontSize:13.5,margin:"0 0 12px",lineHeight:1.55}}>{p.text}</p>
      <div style={{display:"flex",gap:18}}>
        <button style={sty.icoBtn} onClick={()=>toggleLike(p.id)}><Ic.Like on={liked.has(p.id)}/><span style={{marginLeft:5,color:liked.has(p.id)?T.accent:T.textSec,fontSize:12}}>{p.likes}</span></button>
        <button style={sty.icoBtn}><Ic.Chat/><span style={{marginLeft:5,color:T.textSec,fontSize:12}}>{p.comments}</span></button>
      </div>
    </div>
  );

  // ── LOGIN ────────────────────────────────────────────────────────
  if(!loggedIn){
    return(
      <div style={{...sty.shell,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={{width:"100%",maxWidth:340,padding:"0 24px"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <div style={{fontSize:52,marginBottom:6}}>🌿</div>
            <h1 style={{fontSize:38,fontWeight:900,color:T.accent,margin:0,fontFamily:"'Outfit',sans-serif",letterSpacing:-1.5}}>Ease-On</h1>
            <p style={{color:T.textSec,marginTop:6,fontSize:13}}>Your community wellness companion</p>
          </div>
          {!regMode?(<>
            <input style={sty.input} placeholder="Email" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})}/>
            <input style={sty.input} placeholder="Password" type="password" value={loginForm.pw} onChange={e=>setLoginForm({...loginForm,pw:e.target.value})}/>
            <button style={sty.btnFull} onClick={()=>setLoggedIn(true)}>Log In</button>
            <button style={{...sty.btnOutline,marginTop:10}} onClick={()=>setLoggedIn(true)}>Continue as Guest</button>
            <p style={{textAlign:"center",color:T.textSec,marginTop:18,fontSize:13}}>Don't have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>setRegMode(true)}>Register</span></p>
            <div style={{display:"flex",gap:10,marginTop:16}}><button style={sty.socialBtn}>Google</button><button style={sty.socialBtn}>GitHub</button><button style={sty.socialBtn}>Anon</button></div>
          </>):(<>
            <input style={sty.input} placeholder="Full Name" value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})}/>
            <input style={sty.input} placeholder="Username" value={regForm.user} onChange={e=>setRegForm({...regForm,user:e.target.value})}/>
            <input style={sty.input} placeholder="Email" value={regForm.email} onChange={e=>setRegForm({...regForm,email:e.target.value})}/>
            <input style={sty.input} placeholder="Password" type="password" value={regForm.pw} onChange={e=>setRegForm({...regForm,pw:e.target.value})}/>
            <button style={sty.btnFull} onClick={()=>{if(regForm.name)setUser(p=>({...p,name:regForm.name,username:regForm.user||p.username}));setLoggedIn(true)}}>Register</button>
            <p style={{textAlign:"center",color:T.textSec,marginTop:18,fontSize:13}}>Already have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>setRegMode(false)}>Log In</span></p>
          </>)}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREENS
  // ══════════════════════════════════════════════════════════════════

  const HomeScreen=()=>{
    const now=new Date();
    const week=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-now.getDay()+i);return{n:dayNames[i],d:d.getDate(),today:d.toDateString()===now.toDateString()}});
    return(<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h1 style={{fontSize:26,fontWeight:700,color:T.text,margin:0,fontFamily:"'Outfit',sans-serif"}}>Hi, {user.name}</h1>
        <div style={{display:"flex",gap:10}}>
          <button style={sty.icoBtn} onClick={()=>nav("notifs")}><Ic.Bell dot={notifs.some(n=>!n.read)}/></button>
          <button style={sty.icoBtn} onClick={()=>nav("msgList")}><Ic.Msg dot={unreadCount>0}/></button>
        </div>
      </div>
      <div style={{...sty.card,padding:"16px 16px 18px"}}><p style={{color:T.text,fontWeight:600,fontSize:15,margin:"0 0 12px"}}>Today's Mood</p><MoodRow selected={todayMood} onSelect={logMood}/>{todayMood&&<p style={{color:T.accent,fontSize:12,textAlign:"center",marginTop:10,marginBottom:0,fontWeight:500}}>Mood logged ✓</p>}</div>
      <button style={{...sty.btnFull,marginTop:14}} onClick={()=>{setEditJ(null);setJText("");setJMood(null);nav("jEntry")}}>Create Reflection</button>
      <div style={{...sty.card,marginTop:14,display:"flex",alignItems:"center",gap:14,padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:80}}><div style={{fontSize:34,fontWeight:900,color:T.accent,fontFamily:"'Outfit',sans-serif",lineHeight:1}}>{streak}</div><div><div style={{fontSize:11,fontWeight:600,color:T.textSec}}>Day Streak</div><div style={{fontSize:10,color:T.accent,fontWeight:500}}>Keep it up!</div></div></div>
        <div style={{flex:1,display:"flex",justifyContent:"space-around"}}>{week.map((d,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:10,color:T.textSec,fontWeight:600,marginBottom:4}}>{d.n}</div><div style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:d.today?T.accent:"transparent",color:d.today?"#fff":T.textDim}}>{d.d}</div></div>)}</div>
      </div>

      {/* Top Contributors Preview */}
      <div style={{marginTop:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{color:T.text,fontWeight:600,fontSize:15,margin:0,display:"flex",alignItems:"center",gap:6}}><Ic.Trophy/> Top Contributors</p>
          <span style={{color:T.accent,fontSize:13,cursor:"pointer",fontWeight:500}} onClick={()=>nav("topContributors")}>View all</span>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {[...ALL_USERS].sort((a,b)=>b.karma-a.karma).slice(0,4).map((u,i)=>(
            <div key={u.id} onClick={()=>{setViewingProfile(u);nav("userProfile")}} style={{...sty.card,minWidth:100,padding:"12px 10px",textAlign:"center",cursor:"pointer",position:"relative",flex:"0 0 auto"}}>
              {i<3&&<div style={{position:"absolute",top:6,right:8,fontSize:12}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div>}
              <div style={{fontSize:28,marginBottom:4}}>{u.avatar}</div>
              <div style={{color:T.text,fontWeight:600,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.name}</div>
              <div style={{color:T.accent,fontWeight:800,fontSize:13,marginTop:2,fontFamily:"'Outfit',sans-serif"}}>{u.karma} ★</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><p style={{color:T.text,fontWeight:600,fontSize:15,margin:0}}>Your Circles</p><span style={{color:T.accent,fontSize:13,cursor:"pointer",fontWeight:500}} onClick={()=>tabNav("explore")}>View all</span></div>
        {circles.filter(c=>joined.includes(c.id)).slice(0,2).map(c=><div key={c.id} onClick={()=>{setSelCircle(c);nav("circleDetail")}} style={{...sty.card,marginBottom:8,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer"}}><div style={{width:40,height:40,borderRadius:20,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Users/></div><div><div style={{color:T.text,fontWeight:600,fontSize:14}}>{c.tag}</div><div style={{color:T.textSec,fontSize:11}}>{c.members} Members</div></div></div>)}
      </div>
      <div style={{marginTop:22}}><p style={{color:T.text,fontWeight:600,fontSize:15,margin:"0 0 10px"}}>Recent Activity</p>{posts.slice(0,3).map(p=><PostCard key={p.id} p={p}/>)}</div>
      <button style={sty.fab} onClick={()=>nav("createPost")}><Ic.Plus/></button>
    </>);
  };

  // ═══ TOP CONTRIBUTORS — Full Screen ══════════════════════════════
  const TopContributorsScreen=()=>{
    const sorted=[...ALL_USERS].sort((a,b)=>b.karma-a.karma);
    return(<>
      <TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Top Contributors" right={<Ic.Trophy/>}/>
      
      {/* Time filter */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[{k:"all",l:"All Time"},{k:"month",l:"This Month"},{k:"week",l:"This Week"}].map(f=>(
          <Pill key={f.k} active={tcTimeRange===f.k} onClick={()=>setTcTimeRange(f.k)} style={{padding:"6px 14px",fontSize:12}}>{f.l}</Pill>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:8,marginBottom:24,padding:"0 10px"}}>
        {[sorted[1],sorted[0],sorted[2]].map((u,i)=>{
          const rank=i===0?2:i===1?1:3;
          const heights=[120,150,100];
          const medals=["🥈","🥇","🥉"];
          const colors=[T.silver,T.gold,T.bronze];
          return(
            <div key={u.id} style={{flex:1,textAlign:"center",cursor:"pointer"}} onClick={()=>{setViewingProfile(u);nav("userProfile")}}>
              <div style={{fontSize:32,marginBottom:6}}>{u.avatar}</div>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>{u.name}</div>
              <div style={{height:heights[i],background:`linear-gradient(to top, ${colors[i]}22, ${colors[i]}44)`,borderRadius:"12px 12px 0 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:12,border:`1px solid ${colors[i]}44`}}>
                <span style={{fontSize:24}}>{medals[i]}</span>
                <div style={{color:colors[i],fontWeight:900,fontSize:18,fontFamily:"'Outfit',sans-serif",marginTop:4}}>{u.karma}</div>
                <div style={{color:T.textSec,fontSize:10,marginTop:2}}>karma</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      {sorted.map((u,i)=>(
        <div key={u.id} onClick={()=>{setViewingProfile(u);nav("userProfile")}} style={{...sty.card,marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <span style={{fontWeight:900,fontSize:15,color:i===0?T.gold:i===1?T.silver:i===2?T.bronze:T.textDim,width:26,textAlign:"center",fontFamily:"'Outfit',sans-serif"}}>#{i+1}</span>
          <div style={{position:"relative"}}><div style={sty.avatarSm}>{u.avatar}</div>{u.online&&<div style={{position:"absolute",bottom:-1,right:-1}}><Ic.Online/></div>}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:T.text,fontWeight:600,fontSize:13}}>{u.name}</div>
            <div style={{color:T.textSec,fontSize:11}}>@{u.username}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:T.accent,fontWeight:800,fontSize:14,fontFamily:"'Outfit',sans-serif"}}>{u.karma}</div>
            <div style={{color:T.textSec,fontSize:10}}>karma</div>
          </div>
          <button style={sty.btnSmall} onClick={(e)=>{e.stopPropagation();startNewDm(u.id)}}>DM</button>
        </div>
      ))}
    </>);
  };

  // ═══ USER PROFILE (view another user) ════════════════════════════
  const UserProfileScreen=()=>{
    if(!viewingProfile)return null;
    const u=viewingProfile;
    const userPosts=posts.filter(p=>p.userId===u.id);
    return(<>
      <TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{width:80,height:80,borderRadius:40,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,border:`2px solid ${T.accent}`,margin:"0 auto"}}>{u.avatar}</div>
          {u.online&&<div style={{position:"absolute",bottom:4,right:4,width:14,height:14,borderRadius:7,background:"#3fb950",border:`3px solid ${T.bg}`}}/>}
        </div>
        <div style={{color:T.text,fontWeight:700,fontSize:22,marginTop:10}}>{u.name}</div>
        <div style={{color:T.textSec,fontSize:13}}>@{u.username}</div>
        {u.bio&&<p style={{color:T.textDim,fontSize:13,marginTop:8,lineHeight:1.4,padding:"0 20px"}}>{u.bio}</p>}
        <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:14}}>
          <div style={{textAlign:"center"}}><div style={{color:T.accent,fontWeight:800,fontSize:20,fontFamily:"'Outfit',sans-serif"}}>{u.karma}</div><div style={{color:T.textSec,fontSize:11}}>Karma</div></div>
          <div style={{textAlign:"center"}}><div style={{color:T.text,fontWeight:800,fontSize:20,fontFamily:"'Outfit',sans-serif"}}>{userPosts.length}</div><div style={{color:T.textSec,fontSize:11}}>Posts</div></div>
          <div style={{textAlign:"center"}}><div style={{color:T.text,fontWeight:800,fontSize:20,fontFamily:"'Outfit',sans-serif"}}>#{[...ALL_USERS].sort((a,b)=>b.karma-a.karma).findIndex(x=>x.id===u.id)+1}</div><div style={{color:T.textSec,fontSize:11}}>Rank</div></div>
        </div>
        <button style={{...sty.btnFull,marginTop:16,maxWidth:220,marginLeft:"auto",marginRight:"auto"}} onClick={()=>startNewDm(u.id)}>
          Send Direct Message
        </button>
      </div>

      {userPosts.length>0&&<><p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Recent Posts</p>{userPosts.map(p=><PostCard key={p.id} p={p}/>)}</>}
    </>);
  };

  // ═══ ENHANCED MESSAGES LIST ══════════════════════════════════════
  const MsgListScreen=()=>{
    const filteredUsers=ALL_USERS.filter(u=>u.name.toLowerCase().includes(dmSearch.toLowerCase())||u.username.toLowerCase().includes(dmSearch.toLowerCase()));
    
    return(<>
      <TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Messages" right={<button style={sty.icoBtn} onClick={()=>setShowNewDm(!showNewDm)}><Ic.Compose/></button>}/>

      {/* New DM Compose */}
      {showNewDm&&(
        <div style={{...sty.card,marginBottom:16,padding:14}}>
          <p style={{color:T.text,fontWeight:600,fontSize:14,margin:"0 0 10px"}}>New Message</p>
          <input style={sty.input} placeholder="Search users..." value={dmSearch} onChange={e=>setDmSearch(e.target.value)} autoFocus/>
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {(dmSearch?filteredUsers:ALL_USERS.slice(0,5)).map(u=>(
              <div key={u.id} onClick={()=>startNewDm(u.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 4px",cursor:"pointer",borderRadius:8,":hover":{background:T.raised}}}>
                <div style={{position:"relative"}}><div style={sty.avatarSm}>{u.avatar}</div>{u.online&&<div style={{position:"absolute",bottom:-1,right:-1}}><Ic.Online/></div>}</div>
                <div style={{flex:1}}><div style={{color:T.text,fontSize:13,fontWeight:600}}>{u.name}</div><div style={{color:T.textSec,fontSize:11}}>@{u.username} · {u.karma} ★</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation List */}
      {convos.length===0?
        <div style={{textAlign:"center",color:T.textDim,marginTop:60}}><p style={{fontSize:36}}>💬</p><p>No conversations yet</p><p style={{fontSize:12}}>Tap the compose icon to start one</p></div>
      :convos.map(c=>{
        const u=ALL_USERS.find(x=>x.id===c.userId);if(!u)return null;
        const last=c.msgs[c.msgs.length-1];
        const isUnread=last&&last.from!=="me";
        return(
          <div key={c.userId} onClick={()=>{setActiveChat(c.userId);nav("chat")}} style={{...sty.card,marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:isUnread?`1px solid ${T.accent}33`:`1px solid ${T.border}`}}>
            <div style={{position:"relative"}}><div style={sty.avatarMd}>{u.avatar}</div>{u.online&&<div style={{position:"absolute",bottom:0,right:0}}><Ic.Online/></div>}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:T.text,fontWeight:isUnread?700:500,fontSize:14}}>{u.name}</span>
                {last&&<span style={{color:isUnread?T.accent:T.textDim,fontSize:10}}>{last.date||last.time}</span>}
              </div>
              {last&&<div style={{color:isUnread?T.text:T.textSec,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2,fontWeight:isUnread?500:400}}>{last.from==="me"?"You: ":""}{last.text}</div>}
            </div>
            {isUnread&&<div style={{width:10,height:10,borderRadius:5,background:T.accent,flexShrink:0}}/>}
          </div>
        );
      })}
    </>);
  };

  // ═══ ENHANCED CHAT SCREEN ════════════════════════════════════════
  const ChatScreen=()=>{
    const convo=convos.find(c=>c.userId===activeChat);
    const other=ALL_USERS.find(u=>u.id===activeChat);
    const endRef=useRef(null);
    useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[convo?.msgs]);
    if(!convo||!other)return null;

    // Group messages by date
    const grouped=[];
    let lastDate="";
    convo.msgs.forEach(m=>{
      const d=m.date||"";
      if(d!==lastDate){grouped.push({type:"date",label:d});lastDate=d}
      grouped.push({type:"msg",data:m});
    });

    return(
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
        {/* Chat header with profile access */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexShrink:0,padding:"4px 0"}}>
          <button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{setViewingProfile(other);nav("userProfile")}}>
            <div style={sty.avatarSm}>{other.avatar}</div>
            {other.online&&<div style={{position:"absolute",bottom:-1,right:-1}}><Ic.Online/></div>}
          </div>
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setViewingProfile(other);nav("userProfile")}}>
            <div style={{color:T.text,fontWeight:600,fontSize:14}}>{other.name}</div>
            <div style={{color:other.online?"#3fb950":T.textDim,fontSize:11}}>{other.online?"Online":"Offline"} · {other.karma} ★</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
          {convo.msgs.length===0&&(
            <div style={{textAlign:"center",marginTop:40,padding:20}}>
              <div style={{fontSize:48,marginBottom:10}}>{other.avatar}</div>
              <div style={{color:T.text,fontWeight:600,fontSize:16}}>{other.name}</div>
              <div style={{color:T.textSec,fontSize:12,marginTop:4}}>@{other.username} · {other.karma} ★ karma</div>
              {other.bio&&<p style={{color:T.textDim,fontSize:12,marginTop:8}}>{other.bio}</p>}
              <p style={{color:T.textSec,fontSize:13,marginTop:16}}>Start the conversation!</p>
            </div>
          )}
          {grouped.map((item,i)=>{
            if(item.type==="date")return <div key={`d${i}`} style={{textAlign:"center",margin:"12px 0 8px"}}><span style={{background:T.raised,color:T.textDim,fontSize:10,padding:"3px 12px",borderRadius:10,fontWeight:600}}>{item.label}</span></div>;
            const m=item.data;
            return(
              <div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",marginBottom:6}}>
                <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:16,background:m.from==="me"?T.accent:T.card,borderBottomRightRadius:m.from==="me"?4:16,borderBottomLeftRadius:m.from==="me"?16:4}}>
                  <p style={{color:m.from==="me"?"#fff":T.text,fontSize:13,margin:0,lineHeight:1.45}}>{m.text}</p>
                  <p style={{fontSize:10,color:m.from==="me"?"rgba(255,255,255,.55)":T.textDim,margin:"3px 0 0",textAlign:"right"}}>{m.time}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef}/>
        </div>

        {/* Input */}
        <div style={{display:"flex",gap:8,paddingTop:8,flexShrink:0}}>
          <input style={{...sty.input,flex:1,marginBottom:0}} placeholder={`Message ${other.name}...`} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/>
          <button style={{...sty.icoBtn,background:T.card,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={sendMsg}><Ic.Send/></button>
        </div>
      </div>
    );
  };

  // ═══ OTHER SCREENS (condensed) ═══════════════════════════════════
  const ExploreScreen=()=>(<>
    <TopBar title="Explore Circles" right={<button style={sty.btnSmall} onClick={()=>setShowCreateCircle(true)}>+ New</button>}/>
    {showCreateCircle&&<div style={{...sty.card,marginBottom:16,padding:16}}><input style={sty.input} placeholder="Circle name" value={newCircleName} onChange={e=>setNewCircleName(e.target.value)}/><input style={sty.input} placeholder="Description" value={newCircleDesc} onChange={e=>setNewCircleDesc(e.target.value)}/><div style={{display:"flex",gap:8}}><button style={sty.btnSmall} onClick={createCircle}>Create</button><button style={{...sty.btnSmall,background:T.raised,color:T.textSec}} onClick={()=>setShowCreateCircle(false)}>Cancel</button></div></div>}
    {circles.map(c=>{const m=joined.includes(c.id);return(<div key={c.id} style={{...sty.card,marginBottom:12,padding:16}}><div style={{display:"flex",alignItems:"flex-start",gap:12}}><div style={{width:44,height:44,borderRadius:22,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.Users/></div><div style={{flex:1}}><div style={{color:T.text,fontWeight:700,fontSize:15}}>{c.name}</div><div style={{color:T.textSec,fontSize:12}}>{c.tag} · {c.members} members</div><div style={{color:T.textDim,fontSize:12,marginTop:4}}>{c.desc}</div></div></div><div style={{display:"flex",gap:8,marginTop:12}}><Pill active={!m} onClick={()=>m?setJoined(p=>p.filter(id=>id!==c.id)):setJoined(p=>[...p,c.id])}>{m?"Joined ✓":"Join Circle"}</Pill><Pill onClick={()=>{setSelCircle(c);nav("circleDetail")}}>View</Pill></div></div>)})}
  </>);

  const JournalScreen=()=>(<>
    <TopBar title="Journal"/>
    {journals.sort((a,b)=>b.date-a.date).map(j=><div key={j.id} onClick={()=>{setEditJ(j);setJText(j.text);setJMood(j.mood);nav("jEntry")}} style={{...sty.card,marginBottom:10,padding:"12px 14px",cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:22}}>{MOODS.find(m=>m.value===j.mood)?.emoji||"😐"}</span><div style={{flex:1}}><span style={{color:T.textSec,fontSize:12}}>{fmtDate(j.date)}</span><span style={{color:T.textDim,fontSize:12,marginLeft:10}}>{fmtTime(j.date)}</span></div><span style={{fontSize:9,color:T.textDim,background:T.raised,padding:"3px 8px",borderRadius:6}}>{j.vis}</span></div><p style={{color:T.text,fontSize:13,margin:0,lineHeight:1.5}}>{j.text}</p></div>)}
    <button style={sty.fab} onClick={()=>{setEditJ(null);setJText("");setJMood(null);nav("jEntry")}}><Ic.Plus/></button>
  </>);

  const JEntryScreen=()=>(<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><button style={{...sty.icoBtn,color:T.textSec,fontSize:15,fontFamily:"inherit"}} onClick={goBack}>Cancel</button><button style={{...sty.icoBtn,color:T.accent,fontSize:15,fontWeight:700,fontFamily:"inherit"}} onClick={saveJournal}>Save</button></div>
    <p style={{color:T.text,fontWeight:600,fontSize:16,marginBottom:8}}>What's Happening?</p>
    <textarea style={sty.textarea} rows={8} placeholder="Description Text" value={jText} onChange={e=>setJText(e.target.value)}/>
    <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:22,marginBottom:10}}>Feeling:</p>
    <MoodRow selected={jMood} onSelect={m=>setJMood(m.value)} size={28}/>
    {editJ&&<button style={{...sty.btnOutline,marginTop:24,borderColor:T.danger,color:T.danger}} onClick={()=>{setJournals(p=>p.filter(j=>j.id!==editJ.id));goBack()}}>Delete Entry</button>}
  </>);

  const CreatePostScreen=()=>(<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><button style={{...sty.icoBtn,color:T.textSec,fontSize:15,fontFamily:"inherit"}} onClick={goBack}>Cancel</button><button style={{...sty.icoBtn,color:T.accent,fontSize:15,fontWeight:700,fontFamily:"inherit"}} onClick={createPost}>Post</button></div>
    <label style={sty.label}>Circle Tag</label><input style={sty.input} placeholder={user.username} value={newPostCircle} onChange={e=>setNewPostCircle(e.target.value)}/>
    <p style={{color:T.text,fontWeight:600,fontSize:16,marginTop:12,marginBottom:8}}>What's Happening?</p><textarea style={sty.textarea} rows={6} placeholder="Description Text" value={newPostText} onChange={e=>setNewPostText(e.target.value)}/>
    <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:22,marginBottom:10}}>Feeling:</p><MoodRow selected={newPostMood} onSelect={m=>setNewPostMood(m.value)} size={28}/>
    <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:24,marginBottom:10}}>Audience Settings</p>
    <div style={{display:"flex",background:T.raised,borderRadius:10,overflow:"hidden"}}>{["public","private"].map(a=><button key={a} onClick={()=>setNewPostAud(a)} style={{flex:1,padding:"11px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:newPostAud===a?T.accent:"transparent",color:newPostAud===a?"#fff":T.textSec}}>{newPostAud===a&&"✓ "}{a.charAt(0).toUpperCase()+a.slice(1)}</button>)}</div>
  </>);

  const SearchScreen=()=>{
    const fp=posts.filter(p=>p.text.toLowerCase().includes(query.toLowerCase())||p.circle.toLowerCase().includes(query.toLowerCase()));
    const fc=circles.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())||c.tag.toLowerCase().includes(query.toLowerCase()));
    const fu=ALL_USERS.filter(u=>u.name.toLowerCase().includes(query.toLowerCase())||u.username.toLowerCase().includes(query.toLowerCase()));
    return(<>
      <TopBar title="Search"/><input style={sty.input} placeholder="Search posts, circles, users..." value={query} onChange={e=>setQuery(e.target.value)}/>
      {query?(<>
        {fu.length>0&&<><p style={sty.sectionLabel}>USERS</p>{fu.map(u=><div key={u.id} onClick={()=>{setViewingProfile(u);nav("userProfile")}} style={{...sty.card,marginBottom:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><div style={sty.avatarSm}>{u.avatar}</div><div style={{flex:1}}><div style={{color:T.text,fontSize:13,fontWeight:600}}>{u.name}</div><div style={{color:T.textSec,fontSize:11}}>@{u.username}</div></div><div style={{color:T.accent,fontSize:12,fontWeight:700}}>{u.karma} ★</div></div>)}</>}
        {fc.length>0&&<><p style={sty.sectionLabel}>CIRCLES</p>{fc.map(c=><div key={c.id} onClick={()=>{setSelCircle(c);nav("circleDetail")}} style={{...sty.card,marginBottom:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><span>🤝</span><span style={{color:T.text,fontSize:14}}>{c.tag}</span><span style={{color:T.textSec,fontSize:11,marginLeft:"auto"}}>{c.members} members</span></div>)}</>}
        {fp.length>0&&<><p style={sty.sectionLabel}>POSTS</p>{fp.map(p=><PostCard key={p.id} p={p}/>)}</>}
        {fp.length===0&&fc.length===0&&fu.length===0&&<p style={{color:T.textDim,textAlign:"center",marginTop:40}}>No results</p>}
      </>):<div style={{textAlign:"center",marginTop:60,color:T.textDim}}><p style={{fontSize:36}}>🔍</p><p>Search users, circles, or posts</p></div>}
    </>);
  };

  const ProfileScreen=()=>{
    const [pTab,setPTab]=useState("insights");
    const mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date().getMonth()];
    return(<>
      <div style={{display:"flex",justifyContent:"flex-end"}}><button style={sty.icoBtn} onClick={()=>{setSetForm({...user});nav("settings")}}><Ic.Menu/></button></div>
      <div style={{textAlign:"center",marginBottom:20,marginTop:4}}><div style={{width:72,height:72,borderRadius:36,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:36,border:`2px solid ${T.accent}`}}>{user.avatar}</div><div style={{color:T.text,fontWeight:700,fontSize:20}}>{user.anonymous?"Anonymous":user.name}</div><div style={{color:T.textSec,fontSize:13}}>@{user.username}</div></div>
      <div style={{display:"flex",background:T.raised,borderRadius:10,overflow:"hidden",marginBottom:20}}>{["insights","posts"].map(t=><button key={t} onClick={()=>setPTab(t)} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:pTab===t?T.accent:"transparent",color:pTab===t?"#fff":T.textSec,borderRadius:pTab===t?10:0}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
      {pTab==="insights"&&(<>
        <p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Your Insights</p>
        <div style={{display:"flex",gap:8,marginBottom:22}}><StatCard value={user.daysActive} label="Days Active"/><StatCard value={user.postsCreated} label="Posts Created"/><StatCard value={joined.length} label="Circles Joined"/></div>
        <p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Your Moods This Month</p>
        <div style={{...sty.card,padding:16}}><p style={{color:T.textSec,fontSize:13,margin:"0 0 12px",textAlign:"center",fontWeight:600}}>{mo}</p><div style={{display:"flex",justifyContent:"space-around"}}>{MOODS.map(m=><div key={m.value} style={{textAlign:"center"}}><span style={{fontSize:26}}>{m.emoji}</span><div style={{color:T.textSec,fontSize:13,marginTop:4,fontWeight:600}}>{moodCounts[m.value]||0}</div></div>)}</div></div>
        <button style={{...sty.btnOutline,marginTop:14}} onClick={()=>nav("moodGraph")}>View Mood Graph</button>
        <button style={{...sty.btnOutline,marginTop:8}} onClick={()=>nav("reminders")}>Manage Reminders</button>
      </>)}
      {pTab==="posts"&&(posts.filter(p=>p.userId==="me").length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:40}}><p style={{fontSize:36}}>📝</p><p>No posts yet</p></div>:posts.filter(p=>p.userId==="me").map(p=><PostCard key={p.id} p={p}/>))}
    </>);
  };

  const SettingsScreen=()=>(<>
    <TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Settings" titleColor={T.accent}/>
    <p style={sty.sectionLabel}>ACCOUNT INFORMATION</p>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{color:T.text,fontSize:14}}>Anonymous?</span><div style={{display:"flex",background:T.raised,borderRadius:20,overflow:"hidden"}}>{["On","Off"].map(v=><button key={v} onClick={()=>setSetForm({...setForm,anonymous:v==="On"})} style={{padding:"6px 18px",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:(setForm.anonymous&&v==="On")||(!setForm.anonymous&&v==="Off")?T.accent:"transparent",color:(setForm.anonymous&&v==="On")||(!setForm.anonymous&&v==="Off")?"#fff":T.textSec}}>{v}</button>)}</div></div>
    <label style={sty.label}>Display Name</label><input style={sty.input} value={setForm.name} onChange={e=>setSetForm({...setForm,name:e.target.value})}/>
    <label style={sty.label}>Username</label><input style={sty.input} value={setForm.username} onChange={e=>setSetForm({...setForm,username:e.target.value})}/>
    <label style={sty.label}>Password</label><input style={sty.input} type="password" value="••••••••" readOnly/>
    <label style={sty.label}>Email or Phone Number</label><input style={sty.input} value={setForm.phone} onChange={e=>setSetForm({...setForm,phone:e.target.value})}/>
    <button style={{...sty.btnFull,marginTop:20}} onClick={saveSettings}>Save</button>
    <button style={{...sty.btnOutline,marginTop:10,borderColor:T.danger,color:T.danger}} onClick={()=>setLoggedIn(false)}>Log Out</button>
  </>);

  const NotifsScreen=()=>(<><TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Notifications"/>{notifs.map(n=><div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} style={{...sty.card,marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,opacity:n.read?0.5:1,cursor:"pointer"}}><div style={{width:8,height:8,borderRadius:4,background:n.read?"transparent":T.accent,flexShrink:0}}/><div style={{flex:1}}><div style={{color:T.text,fontSize:13}}>{n.text}</div><div style={{color:T.textSec,fontSize:11,marginTop:2}}>{n.time}</div></div></div>)}</>);

  const CircleDetailScreen=()=>{
    if(!selCircle)return null;const cp=posts.filter(p=>p.circle===selCircle.tag);const m=joined.includes(selCircle.id);
    return(<><TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title={selCircle.name}/><p style={{color:T.textSec,fontSize:13,margin:"-10px 0 6px"}}>{selCircle.tag} · {selCircle.members} members</p><p style={{color:T.textDim,fontSize:13,marginBottom:14}}>{selCircle.desc}</p><div style={{display:"flex",gap:8,marginBottom:20}}><Pill active={!m} onClick={()=>m?setJoined(p=>p.filter(id=>id!==selCircle.id)):setJoined(p=>[...p,selCircle.id])}>{m?"Leave Circle":"Join Circle"}</Pill>{m&&<Pill onClick={()=>nav("groupChat")}>Group Chat</Pill>}</div><p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Circle Feed</p>{cp.length===0?<p style={{color:T.textDim,textAlign:"center",marginTop:30,fontSize:13}}>No posts yet</p>:cp.map(p=><PostCard key={p.id} p={p}/>)}</>);
  };

  const GroupChatScreen=()=>{
    const endRef=useRef(null);useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[groupMsgs]);
    return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      <TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title={(selCircle?.name||"Group")+" Chat"}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>{groupMsgs.map((m,i)=>{const u=ALL_USERS.find(x=>x.id===m.from);return(<div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",marginBottom:8}}><div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:16,background:m.from==="me"?T.accent:T.card,borderBottomRightRadius:m.from==="me"?4:16,borderBottomLeftRadius:m.from==="me"?16:4}}>{m.from!=="me"&&<p style={{fontSize:10,color:T.accent,margin:"0 0 4px",fontWeight:600}}>{u?.name||"Member"}</p>}<p style={{color:m.from==="me"?"#fff":T.text,fontSize:13,margin:0,lineHeight:1.45}}>{m.text}</p><p style={{fontSize:10,color:m.from==="me"?"rgba(255,255,255,.55)":T.textDim,margin:"3px 0 0",textAlign:"right"}}>{m.time}</p></div></div>)})}<div ref={endRef}/></div>
      <div style={{display:"flex",gap:8,paddingTop:8,flexShrink:0}}><input style={{...sty.input,flex:1,marginBottom:0}} placeholder="Message the group..." value={groupInput} onChange={e=>setGroupInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendGroupMsg()}/><button style={{...sty.icoBtn,background:T.card,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={sendGroupMsg}><Ic.Send/></button></div>
    </div>);
  };

  const MoodGraphScreen=()=>{
    const data=moodLog.slice(-14);
    return(<><TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Mood Trends"/><div style={{...sty.card,padding:20}}><div style={{display:"flex",alignItems:"flex-end",gap:6,height:170,justifyContent:"center"}}>{data.map((d,i)=>{const m=MOODS.find(x=>x.value===d.value);return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1,maxWidth:36}}><span style={{fontSize:15}}>{m?.emoji}</span><div style={{width:"100%",maxWidth:28,borderRadius:6,height:(d.value/5)*120,background:`linear-gradient(to top, ${m?.color}66, ${m?.color})`}}/><span style={{fontSize:9,color:T.textDim}}>{d.date.getDate()}/{d.date.getMonth()+1}</span></div>)})}</div></div><div style={{...sty.card,marginTop:14,padding:16}}><p style={{color:T.text,fontWeight:600,fontSize:14,margin:"0 0 6px"}}>Summary</p><p style={{color:T.textSec,fontSize:13,margin:0,lineHeight:1.5}}>{moodLog.length} moods logged. Average: {(moodLog.reduce((a,h)=>a+h.value,0)/moodLog.length).toFixed(1)}/5.{streak>1&&` ${streak}-day streak!`}</p></div></>);
  };

  const RemindersScreen=()=>(<><TopBar left={<button style={sty.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Reminders"/>{reminders.map(r=><div key={r.id} style={{...sty.card,marginBottom:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{color:T.text,fontSize:14,fontWeight:500}}>{r.text}</div><div style={{color:T.textSec,fontSize:12}}>{r.time}</div></div><button onClick={()=>setReminders(p=>p.map(x=>x.id===r.id?{...x,on:!x.on}:x))} style={{width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",background:r.on?T.accent:T.border,position:"relative",transition:"background .2s"}}><div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:2,left:r.on?22:2,transition:"left .2s"}}/></button></div>)}</>);

  // ── Router ──────────────────────────────────────────────────────
  const screens={home:HomeScreen,explore:ExploreScreen,journal:JournalScreen,search:SearchScreen,profile:ProfileScreen,jEntry:JEntryScreen,createPost:CreatePostScreen,settings:SettingsScreen,notifs:NotifsScreen,msgList:MsgListScreen,chat:ChatScreen,circleDetail:CircleDetailScreen,groupChat:GroupChatScreen,moodGraph:MoodGraphScreen,reminders:RemindersScreen,topContributors:TopContributorsScreen,userProfile:UserProfileScreen};
  const Screen=screens[screen]||HomeScreen;
  const showTabs=["home","explore","journal","search","profile"].includes(screen);

  return(
    <div style={sty.shell}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={sty.phone}>
        <div style={sty.content}><Screen/></div>
        {showTabs&&<div style={sty.tabBar}>{[{k:"home",I:Ic.Home,l:"Home"},{k:"explore",I:Ic.Compass,l:"Explore"},{k:"journal",I:Ic.Book,l:"Journal"},{k:"search",I:Ic.Search,l:"Search"},{k:"profile",I:Ic.Heart,l:"Profile"}].map(t=><button key={t.k} style={sty.tabBtn} onClick={()=>tabNav(t.k)}><t.I a={tab===t.k}/><span style={{fontSize:9,color:tab===t.k?T.accent:T.textSec,marginTop:3,fontWeight:tab===t.k?600:400}}>{t.l}</span></button>)}</div>}
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const sty={
  shell:{minHeight:"100vh",background:"#000",display:"flex",justifyContent:"center",fontFamily:"'Outfit',-apple-system,BlinkMacSystemFont,sans-serif"},
  phone:{width:"100%",maxWidth:420,minHeight:"100vh",background:T.bg,position:"relative",display:"flex",flexDirection:"column"},
  content:{flex:1,overflowY:"auto",padding:"16px 18px 88px",WebkitOverflowScrolling:"touch"},
  card:{background:T.card,borderRadius:14,padding:16,border:`1px solid ${T.border}`},
  input:{width:"100%",padding:"12px 14px",background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"},
  textarea:{width:"100%",padding:"12px 14px",background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5},
  label:{color:T.textSec,fontSize:12,display:"block",marginBottom:4,fontWeight:500},
  sectionLabel:{color:T.textSec,fontSize:11,fontWeight:700,letterSpacing:0.5,marginBottom:8,marginTop:16},
  btnFull:{width:"100%",padding:"13px 0",background:T.accent,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  btnOutline:{width:"100%",padding:"12px 0",background:"transparent",border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"},
  btnSmall:{padding:"7px 16px",background:T.accent,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  socialBtn:{flex:1,padding:"10px 0",background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:500},
  icoBtn:{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",fontFamily:"inherit"},
  dot:{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:4,background:T.danger},
  avatarSm:{width:34,height:34,borderRadius:17,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0},
  avatarMd:{width:42,height:42,borderRadius:21,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
  fab:{position:"fixed",bottom:80,right:"calc(50% - 185px)",width:52,height:52,borderRadius:26,background:T.accent,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 24px rgba(63,184,160,0.35)",zIndex:10},
  tabBar:{display:"flex",justifyContent:"space-around",padding:"6px 0 14px",background:T.surface,borderTop:`1px solid ${T.border}`,position:"sticky",bottom:0,flexShrink:0},
  tabBtn:{display:"flex",flexDirection:"column",alignItems:"center",background:"none",border:"none",cursor:"pointer",padding:"4px 12px",gap:1,fontFamily:"inherit"},
};
