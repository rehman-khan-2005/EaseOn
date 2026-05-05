import { useState, useEffect, useRef } from "react";
import api from "./api";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, googleProvider, signInWithPopup, sendPasswordResetEmail } from "./firebase";

/* ═══════════════════════════════════════════════════════════════════
   EASE-ON — Community Wellness App
   Firebase Auth · PostgreSQL Backend · No hardcoded data
   ═══════════════════════════════════════════════════════════════════ */

const T = {
  bg: "#0e1117", surface: "#161b22", card: "#1c2129", raised: "#242b35",
  accent: "#3fb8a0", accentGlow: "rgba(63,184,160,0.15)",
  text: "#f0f2f5", textSec: "#8b949e", textDim: "#6e7681",
  border: "#21262d", danger: "#f85149", gold: "#f1c40f", silver: "#bdc3c7", bronze: "#cd7f32",
};

const MOODS = [
  { emoji: "😢", label: "Awful", value: 1, color: "#f85149" },
  { emoji: "😞", label: "Bad", value: 2, color: "#d29922" },
  { emoji: "😐", label: "Okay", value: 3, color: "#e3b341" },
  { emoji: "🙂", label: "Good", value: 4, color: "#3fb950" },
  { emoji: "😁", label: "Great", value: 5, color: "#3fb8a0" },
];

const AVATARS = ["😊","🧑‍💻","🧑‍🎨","🧑‍🔬","👩‍🏫","🧑‍🎤","👩‍💻","🧑‍🍳","👩‍🎨","🦊","🐱","🌸","🌊","⭐","🔥","🎵","🎮","📚","🏀","🎨"];

const fmtDate = d => { if (!d || isNaN(d)) return "—"; return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
const fmtTime = d => { if (!d || isNaN(d)) return "—"; return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); };
const dayNames = ["S","M","T","W","T","F","S"];
const todayStr = () => new Date().toDateString();
const timeAgo = d => { if (!d || isNaN(d)) return "Just now"; const s = Math.floor((Date.now() - d) / 1000); if (s < 0) return "Just now"; if (s < 5) return "Just now"; if (s < 60) return s + "s ago"; if (s < 3600) return Math.floor(s / 60) + "m ago"; if (s < 86400) return Math.floor(s / 3600) + "h ago"; if (s < 604800) return Math.floor(s / 86400) + "d ago"; return fmtDate(d); };

// ─── Icons ──────────────────────────────────────────────────────────
const Ic = {
  Home:({a})=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?T.accent:"none"} stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Compass:({a})=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  Book:({a})=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?T.accent:"none"} stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Search:({a})=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Heart:({a})=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?T.accent:"none"} stroke={a?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Back:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Menu:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  Plus:()=><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Send:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Bell:({dot})=><><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>{dot&&<span style={S.dot}/>}</>,
  Msg:({dot})=><><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{dot&&<span style={{...S.dot,right:-2}}/>}</>,
  Like:({on})=><svg width="16" height="16" viewBox="0 0 24 24" fill={on?T.accent:"none"} stroke={on?T.accent:T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
  Chat:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Users:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Trophy:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
  Compose:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  Online:()=><div style={{width:8,height:8,borderRadius:4,background:"#3fb950",border:`2px solid ${T.card}`}}/>,
  X:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const Pill=({children,active,onClick,s:x})=><button onClick={onClick} style={{padding:"8px 20px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:active?T.accent:T.raised,color:active?"#fff":T.textSec,...x}}>{children}</button>;
const StatCard=({value,label})=><div style={{...S.card,flex:1,textAlign:"center",padding:"14px 6px",minWidth:0}}><div style={{fontSize:26,fontWeight:800,color:T.text,fontFamily:"'Outfit',sans-serif",lineHeight:1}}>{value}</div><div style={{fontSize:10,color:T.textSec,marginTop:6}}>{label}</div></div>;
const TopBar=({left,title,right,titleColor})=><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,minHeight:32}}><div style={{display:"flex",alignItems:"center",gap:10}}>{left}{title&&<h2 style={{fontSize:20,fontWeight:700,color:titleColor||T.text,margin:0,fontFamily:"'Outfit',sans-serif"}}>{title}</h2>}</div><div style={{display:"flex",alignItems:"center",gap:8}}>{right}</div></div>;

// ═══════════════════════════════════════════════════════════════════
export default function EaseOn(){
  const[screen,setScreen]=useState("login");
  const[navHist,setNavHist]=useState([]);
  const[tab,setTab]=useState("home");

  // Auth
  const[loginEmail,setLoginEmail]=useState("");
  const[loginPw,setLoginPw]=useState("");
  const[loginErr,setLoginErr]=useState("");
  const[regMode,setRegMode]=useState(false);
  const[regName,setRegName]=useState("");
  const[regUser,setRegUser]=useState("");
  const[regEmail,setRegEmail]=useState("");
  const[regPw,setRegPw]=useState("");
  const[regErr,setRegErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[authChecked,setAuthChecked]=useState(false);
  const[dataLoading,setDataLoading]=useState(false);
  const[showForgotPw,setShowForgotPw]=useState(false);
  const[resetEmail,setResetEmail]=useState("");
  const[resetMsg,setResetMsg]=useState("");
  const[fcmToast,setFcmToast]=useState(null);

  // User — all from backend
  const[user,setUser]=useState({id:null,name:"",username:"",avatar:"😊",email:"",phone:"",anonymous:false,karma:0});
  const[allUsers,setAllUsers]=useState([]);

  // Mood — all from backend
  const[todayMood,setTodayMood]=useState(null);
  const[moodLoggedDate,setMoodLoggedDate]=useState(null);
  const[moodLog,setMoodLog]=useState([]);
  const[moodCounts,setMoodCounts]=useState({1:0,2:0,3:0,4:0,5:0});
  const calcStreak=()=>{let s=0;const dates=moodLog.map(m=>m.date.toDateString());const t=new Date();for(let i=0;i<60;i++){const d=new Date(t);d.setDate(t.getDate()-i);if(dates.includes(d.toDateString()))s++;else if(i>0)break;}return s};

  // Journal — all from backend
  const[journals,setJournals]=useState([]);
  const[editJ,setEditJ]=useState(null);
  const[jText,setJText]=useState("");
  const[jMood,setJMood]=useState(null);
  const[jVis,setJVis]=useState("private");

  // Circles — all from backend
  const[circles,setCircles]=useState([]);
  const[joined,setJoined]=useState([]);
  const[selCircle,setSelCircle]=useState(null);
  const[showCreateCircle,setShowCreateCircle]=useState(false);
  const[newCircleName,setNewCircleName]=useState("");
  const[newCircleDesc,setNewCircleDesc]=useState("");

  // Posts — all from backend
  const[posts,setPosts]=useState([]);
  const[liked,setLiked]=useState(new Set());
  const[newPostText,setNewPostText]=useState("");
  const[newPostCircles,setNewPostCircles]=useState([]);
  const[newCircleInput,setNewCircleInput]=useState("");
  const[newPostMood,setNewPostMood]=useState(null);
  const[newPostAud,setNewPostAud]=useState("public");
  const[viewingComments,setViewingComments]=useState(null);

  // DMs — all from backend
  const[convos,setConvos]=useState([]);
  const[activeChat,setActiveChat]=useState(null);
  const[msgInput,setMsgInput]=useState("");
  const[dmSearch,setDmSearch]=useState("");
  const[showNewDm,setShowNewDm]=useState(false);
  const[viewingProfile,setViewingProfile]=useState(null);
  const[profileTab,setProfileTab]=useState("posts");
  const[tcTimeRange,setTcTimeRange]=useState("all");

  // Notifications — all from backend
  const[notifs,setNotifs]=useState([]);
  const[settingsName,setSettingsName]=useState("");
  const[settingsUser,setSettingsUser]=useState("");
  const[settingsPhone,setSettingsPhone]=useState("");
  const[settingsAnon,setSettingsAnon]=useState(false);
  const[query,setQuery]=useState("");
  const[reminders,setReminders]=useState([{id:1,text:"Log your mood",time:"9:00 AM",on:true},{id:2,text:"Write a reflection",time:"8:00 PM",on:true}]);
  const[showAddReminder,setShowAddReminder]=useState(false);
  const[editReminderId,setEditReminderId]=useState(null);
  const[reminderText,setReminderText]=useState("");
  const[reminderTime,setReminderTime]=useState("09:00");
  const[groupMsgs,setGroupMsgs]=useState([]);
  const[groupInput,setGroupInput]=useState("");
  const[pTab,setPTab]=useState("insights");
  const[showAvatarPicker,setShowAvatarPicker]=useState(false);
  const[happyMemory,setHappyMemory]=useState(null);

  const endRef=useRef(null);
  const groupEndRef=useRef(null);
  const[,setTick]=useState(0);

  // Detect Capacitor native app (disables features that don't work in WKWebView)
  const isNativeApp=typeof window!=="undefined"&&!!window.Capacitor;

  // Notification banner state
  const[showNotifBanner,setShowNotifBanner]=useState(false);
  const[notifBannerDismissed,setNotifBannerDismissed]=useState(false);

  useEffect(()=>{
    if(!authChecked||!user.id||notifBannerDismissed)return;
    // On native apps, always show banner (permissions handled by native)
    if(isNativeApp){setShowNotifBanner(true);return}
    if(typeof window==="undefined"||!("Notification" in window))return;
    if(Notification.permission==="default")setShowNotifBanner(true);
  },[authChecked,user.id,notifBannerDismissed]);

  // Today's reminders: logged mood? made journal entry today?
  const loggedToday=moodLoggedDate===todayStr();
  const journaledToday=journals.some(j=>{const d=j.date instanceof Date?j.date:new Date(j.date);return d.toDateString()===todayStr()});

  // Timer: re-render every 15s so timeAgo updates in real-time
  useEffect(()=>{
    const timer=setInterval(()=>setTick(t=>t+1),15000);
    return()=>clearInterval(timer);
  },[]);

  // ─── Request notification permission & save FCM token ───────────
  const requestNotificationPermission=async()=>{
    // Native app path — use Capacitor Push Notifications
    if(typeof window!=="undefined"&&window.Capacitor){
      try{
        const{PushNotifications}=await import("@capacitor/push-notifications");
        // Check current permission status first
        const current=await PushNotifications.checkPermissions();
        let finalStatus=current.receive;
        if(finalStatus!=="granted"){
          // This triggers the native iOS/Android OS permission popup
          const reqResult=await PushNotifications.requestPermissions();
          finalStatus=reqResult.receive;
        }
        if(finalStatus==="granted"){
          await PushNotifications.register();
          PushNotifications.addListener("registration",token=>{
            console.log("Push token:",token.value);
            api.saveFcmToken(token.value).catch(e=>console.log("Token save error:",e));
          });
          PushNotifications.addListener("registrationError",err=>console.log("Push reg error:",err));
          // Foreground notifications
          PushNotifications.addListener("pushNotificationReceived",notification=>{
            const title=notification.title||"Ease-On";
            const body=notification.body||"You have a new notification";
            setFcmToast({title,body});
            setNotifs(p=>[{id:"n"+Date.now(),text:body,read:false,ts:Date.now()},...p]);
            setTimeout(()=>setFcmToast(null),5000);
          });
        }else if(finalStatus==="denied"){
          // User denied — they'll need to enable from device settings
          console.log("Push notifications were denied. Enable in device settings.");
        }
      }catch(e){console.log("Native push setup error:",e)}
      return;
    }
    // Web path — FCM via service worker
    if(typeof window==="undefined"||!("serviceWorker" in navigator)||!("Notification" in window))return;
    try{
      const permission=await Notification.requestPermission();
      if(permission==="granted"){
        const{getMessaging,getToken,onMessage:onMsg}=await import("firebase/messaging");
        const fbApp=(await import("firebase/app")).getApp();
        const msg=getMessaging(fbApp);
        const token=await getToken(msg,{vapidKey:"BOef8d5NXkPRDldCw9wL79FNokmqCvKr-oouhILNVRYS1JW-qU8RwWQ8-wPjmiW7GCtko-cxj72ju7jAV8yYl0g"});
        if(token)api.saveFcmToken(token).catch(e=>console.log("FCM token save error:",e));
        onMsg(msg,(payload)=>{
          const title=payload.notification?.title||"Ease-On";
          const body=payload.notification?.body||"You have a new notification";
          setFcmToast({title,body});
          setNotifs(p=>[{id:"n"+Date.now(),text:body,read:false,ts:Date.now()},...p]);
          setTimeout(()=>setFcmToast(null),5000);
        });
      }
    }catch(e){console.log("Notification setup error:",e)}
  };

  // ─── Firebase Auth listener ─────────────────────────────────────
  useEffect(()=>{
    // Safety timeout — if onAuthStateChanged never fires (iOS WKWebView), show login after 5s
    const timeout=setTimeout(()=>{if(!authChecked){setAuthChecked(true);console.log("Auth timeout — showing login")}},5000);

    const unsub=onAuthStateChanged(auth,async(firebaseUser)=>{
      clearTimeout(timeout);
      if(firebaseUser){
        try{
          setDataLoading(true);
          const me=await api.getMe();
          setUser({id:me.id,name:me.display_name||me.username,username:me.username,avatar:me.avatar_url||"😊",email:me.email,phone:me.phone||"",anonymous:me.is_anonymous||false,karma:me.karma_score||0});
          setSettingsName(me.display_name||me.username);setSettingsUser(me.username);setSettingsPhone(me.phone||"");
          setScreen("home");setTab("home");
          await loadAllData();
          setDataLoading(false);
          // On native apps, trigger permission popup immediately (native OS handles the dialog)
          // On web, the banner shows for the user to click Enable
          if(typeof window!=="undefined"&&window.Capacitor){
            requestNotificationPermission();
          }
        }catch(e){
          setDataLoading(false);
          console.log("Profile not found, user may need to complete registration");
        }
      }
      setAuthChecked(true);
    });
    return ()=>{clearTimeout(timeout);unsub()};
  },[]);

  // ─── FCM foreground message listener ────────────────────────────
  // (FCM only works on web, not in Capacitor apps)

  useEffect(()=>{if(screen==="chat")endRef.current?.scrollIntoView({behavior:"smooth"})},[screen,convos]);

  // Fetch public journals when viewing another user's profile
  useEffect(()=>{
    if(!viewingProfile||!viewingProfile.id||viewingProfile.id===user.id)return;
    if(viewingProfile.publicJournals)return; // Already loaded
    api.getPublicJournals(viewingProfile.id).then(entries=>{
      if(!Array.isArray(entries))return;
      const mapped=entries.map(j=>{const cts=j.created_at||j.createdAt;const ets=j.updated_at||j.updatedAt;const cp=cts?new Date(cts):null;const ep=ets?new Date(ets):null;return{id:j.id,date:cp&&!isNaN(cp)?cp:new Date(),editedAt:ep&&!isNaN(ep)&&ets!==cts?ep:null,text:j.body||j.text,mood:j.mood_value||3,vis:"public"}});
      setViewingProfile(p=>p?{...p,publicJournals:mapped}:p);
    }).catch(e=>console.log("Public journals fetch error:",e));
  },[viewingProfile?.id]);
  useEffect(()=>{if(screen==="groupChat")groupEndRef.current?.scrollIntoView({behavior:"smooth"})},[screen,groupMsgs]);

  // ─── Load all data from backend ─────────────────────────────────
  const loadAllData=async()=>{
    try{
      const[moodsRes,journalsRes,circlesRes,postsRes,notifsRes,usersRes,inboxRes]=await Promise.allSettled([
        api.getMoods(60),api.getJournals(),api.getCircles(),api.getPosts(),api.getNotifications(),api.getTopContributors(50),api.getInbox()
      ]);
      if(moodsRes.status==="fulfilled"){
        const moods=moodsRes.value?.moods||moodsRes.value||[];
        if(Array.isArray(moods)){
          setMoodLog(moods.map(m=>({date:new Date(m.checked_in_at),value:m.mood_value})));
          const counts={1:0,2:0,3:0,4:0,5:0};
          moods.forEach(m=>{counts[m.mood_value]=(counts[m.mood_value]||0)+1});
          setMoodCounts(counts);
          const todayEntry=moods.find(m=>new Date(m.checked_in_at).toDateString()===todayStr());
          if(todayEntry){setTodayMood(todayEntry.mood_value);setMoodLoggedDate(todayStr())}
        }
      }
      if(journalsRes.status==="fulfilled"){
        const entries=journalsRes.value?.entries||journalsRes.value||[];
        if(Array.isArray(entries))setJournals(entries.map(j=>{const cts=j.created_at||j.createdAt;const ets=j.updated_at||j.updatedAt;const cp=cts?new Date(cts):null;const ep=ets?new Date(ets):null;return{id:j.id,date:cp&&!isNaN(cp)?cp:new Date(),editedAt:ep&&!isNaN(ep)&&ets!==cts?ep:null,text:j.body||j.text,mood:j.mood_value||3,vis:j.visibility||"private"}}));
      }
      if(circlesRes.status==="fulfilled"){
        const circs=circlesRes.value?.circles||circlesRes.value||[];
        if(Array.isArray(circs)){
          setCircles(circs.map(c=>({id:c.id,name:c.name,tag:"#"+c.name.replace(/\s/g,""),members:c.member_count||0,desc:c.description||"",vis:c.visibility||"public"})));
          try{const jr=await api.getJoinedCircles();if(Array.isArray(jr))setJoined(jr.map(c=>c.id))}catch(e){}
        }
      }
      if(postsRes.status==="fulfilled"){
        const ps=postsRes.value?.posts||postsRes.value||[];
        if(Array.isArray(ps))setPosts(ps.map(p=>{const pts=p.created_at||p.createdAt;const parsed=pts?new Date(pts).getTime():Date.now();return{id:p.id,userId:p.user_id,username:p.user?.username||"user",avatar:p.user?.avatar_url||"😊",circle:p.circle_tag||"#General",text:p.text,mood:p.mood_value||3,ts:isNaN(parsed)?Date.now():parsed,likes:p.likes||0,comments:(p.comments||[]).map(c=>{const cts=c.created_at||c.createdAt;const cp=cts?new Date(cts).getTime():Date.now();return{user:c.user?.username||"user",avatar:c.user?.avatar_url||"😊",text:c.text,ts:isNaN(cp)?Date.now():cp}})}}));
      }
      if(notifsRes.status==="fulfilled"){
        const ns=notifsRes.value?.notifications||notifsRes.value||[];
        if(Array.isArray(ns))setNotifs(ns.map(n=>{const nts=n.created_at||n.createdAt;const parsed=nts?new Date(nts).getTime():Date.now();return{id:n.id,text:n.content,read:n.is_read,ts:isNaN(parsed)?Date.now():parsed}}));
      }
      if(usersRes.status==="fulfilled"){
        const us=Array.isArray(usersRes.value)?usersRes.value:(usersRes.value?.users||[]);
        if(Array.isArray(us))setAllUsers(us.map(u=>({id:u.id,name:u.display_name||u.username,username:u.username,avatar:u.avatar_url||"😊",karma:u.karma_score||0,weekKarma:u.week_karma||0,monthKarma:u.month_karma||0,bio:"",online:false})));
      }
      if(inboxRes.status==="fulfilled"){
        const inbox=Array.isArray(inboxRes.value)?inboxRes.value:[];
        if(inbox.length>0)setConvos(inbox.map(c=>({userId:c.partner?.id,unread:(c.unread||0)>0,msgs:[{from:c.lastMessage?.from_me?"me":c.partner?.id,text:c.lastMessage?.content||"",time:c.lastMessage?.sent_at?timeAgo(new Date(c.lastMessage.sent_at)):"",date:c.lastMessage?.sent_at?fmtDate(new Date(c.lastMessage.sent_at)):""}]})));
      }
    }catch(e){console.log("Data load error:",e)}
  };

  // Nav
  const nav=s=>{setNavHist(h=>[...h,screen]);setScreen(s)};
  const goBack=()=>{if(navHist.length>0){const p=navHist[navHist.length-1];setNavHist(h=>h.slice(0,-1));setScreen(p)}else setScreen(tab)};
  const tabNav=t=>{setTab(t);setNavHist([]);setScreen(t)};

  // Compute average mood from ALL sources (mood log, journals, posts) — rounded up
  // This represents the user's overall mood assessment today
  const computeTodayMood=()=>{
    const today=todayStr();
    const vals=[];
    // From mood log
    moodLog.forEach(m=>{const d=m.date instanceof Date?m.date:new Date(m.date);if(d.toDateString()===today&&m.value)vals.push(m.value)});
    // From journal entries (only mine)
    journals.forEach(j=>{const d=j.date instanceof Date?j.date:new Date(j.date);if(d.toDateString()===today&&j.mood)vals.push(j.mood)});
    // From my posts (inline check to avoid using isMyPost before it's defined)
    posts.forEach(p=>{const mine=p.userId==="me"||p.userId===user.id||p.username===user.username;if(mine&&p.mood&&new Date(p.ts||Date.now()).toDateString()===today)vals.push(p.mood)});
    if(vals.length===0)return null;
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    return Math.ceil(avg);
  };
  const avgTodayMood=computeTodayMood();

  // ─── Actions (all sync to backend) ──────────────────────────────
  const logMood=m=>{
    if(moodLoggedDate===todayStr())return;
    setTodayMood(m.value);setMoodLoggedDate(todayStr());
    setMoodLog(p=>[...p,{date:new Date(),value:m.value}]);
    setMoodCounts(p=>({...p,[m.value]:(p[m.value]||0)+1}));
    if(m.value<=2){const happy=moodLog.filter(x=>x.value>=4);if(happy.length>0)setHappyMemory(happy[happy.length-1])}
    api.logMood({mood_value:m.value,emoji_label:m.label.toLowerCase()}).catch(e=>console.log("Mood sync:",e));
  };

  const saveJournal=()=>{
    if(!jText.trim())return;
    if(editJ){
      setJournals(p=>p.map(j=>j.id===editJ.id?{...j,text:jText,mood:jMood||j.mood,vis:jVis,editedAt:new Date()}:j));
      api.updateJournal(editJ.id,{body:jText,mood_value:jMood||editJ.mood,visibility:jVis}).catch(()=>{});
    }else{
      const nid="j"+Date.now();
      setJournals(p=>[{id:nid,date:new Date(),text:jText,mood:jMood||3,vis:jVis,userId:user.id,username:user.username,avatar:user.avatar},...p]);
      api.createJournal({body:jText,mood_value:jMood||3,visibility:jVis}).then(d=>{if(d?.id)setJournals(p=>p.map(j=>j.id===nid?{...j,id:d.id}:j))}).catch(()=>{});
    }
    setJText("");setJMood(null);setJVis("private");setEditJ(null);goBack();
  };

  const createPost=()=>{
    if(!newPostText.trim())return;
    // Build list of target circles — default to #General if none selected
    const targetTags=(newPostCircles.length>0?newPostCircles:["#General"]).map(t=>t.startsWith("#")?t:"#"+t.replace(/\s/g,""));
    targetTags.forEach(circleTag=>{
      const lid="p"+Date.now()+Math.random();
      // Auto-create circle if it doesn't exist
      const existingCircle=circles.find(c=>c.tag.toLowerCase()===circleTag.toLowerCase());
      if(!existingCircle&&circleTag!=="#General"){
        const name=circleTag.substring(1);
        api.createCircle({name,description:"Auto-created from post"}).then(d=>{
          if(d?.circle){setCircles(p=>[...p,{id:d.circle.id,name,tag:circleTag,members:1,desc:"Auto-created from post",vis:"public"}]);setJoined(p=>[...p,d.circle.id])}
        }).catch(()=>{});
      }
      setPosts(p=>[{id:lid,userId:user.id||"me",username:user.username,avatar:user.avatar,circle:circleTag,text:newPostText,mood:newPostMood||3,ts:Date.now(),likes:0,comments:[]},...p]);
      api.createPost({text:newPostText,circle_tag:circleTag,mood_value:newPostMood||3,visibility:newPostAud}).then(d=>{if(d?.id)setPosts(p=>p.map(x=>x.id===lid?{...x,id:d.id}:x))}).catch(()=>{});
    });
    setNewPostText("");setNewPostCircles([]);setNewCircleInput("");setNewPostMood(null);goBack();
  };

  // When someone likes your post — increase your karma by 1 (tracked locally; server is authoritative)
  const likeReceived=pid=>{const post=posts.find(x=>x.id===pid);if(post&&isMyPost(post)&&post.userId===user.id)setUser(p=>({...p,karma:p.karma+1}))};

  const toggleLike=pid=>{const s=new Set(liked);if(s.has(pid)){s.delete(pid);setPosts(p=>p.map(x=>x.id===pid?{...x,likes:x.likes-1}:x));api.unlikePost(pid).catch(()=>{})}else{s.add(pid);setPosts(p=>p.map(x=>x.id===pid?{...x,likes:x.likes+1}:x));api.likePost(pid).catch(()=>{})}setLiked(s)};

  const sendMsg=()=>{if(!msgInput.trim()||!activeChat)return;const nowTs=Date.now();setConvos(p=>p.map(c=>c.userId===activeChat?{...c,unread:false,msgs:[...c.msgs,{from:"me",text:msgInput,ts:nowTs,time:fmtTime(new Date()),date:"Today"}]}:c));api.sendDM(activeChat,msgInput).catch(()=>{});setMsgInput("")};
  const startNewDm=uid=>{if(!convos.find(c=>c.userId===uid))setConvos(p=>[{userId:uid,unread:false,msgs:[]},...p]);setActiveChat(uid);setShowNewDm(false);setDmSearch("");nav("chat");loadConversation(uid)};
  const openChat=uid=>{setActiveChat(uid);setConvos(p=>p.map(c=>c.userId===uid?{...c,unread:false}:c));api.markRead(uid).catch(()=>{});nav("chat");loadConversation(uid)};

  // Load full message history for a conversation
  const loadConversation=async(uid)=>{
    try{
      const res=await api.getConversation(uid);
      const msgs=res?.messages||res?.data||(Array.isArray(res)?res:[]);
      if(!Array.isArray(msgs))return;
      const mapped=msgs.map(m=>{const mts=m.sent_at||m.created_at||m.createdAt;const parsed=mts?new Date(mts).getTime():Date.now();return{from:m.sender_id===user.id||m.from_me?"me":m.sender_id||uid,text:m.content||m.text||"",ts:isNaN(parsed)?Date.now():parsed,time:fmtTime(new Date(isNaN(parsed)?Date.now():parsed)),date:fmtDate(new Date(isNaN(parsed)?Date.now():parsed))}}).sort((a,b)=>a.ts-b.ts);
      setConvos(p=>{const idx=p.findIndex(c=>c.userId===uid);if(idx===-1)return[...p,{userId:uid,unread:false,msgs:mapped}];const updated=[...p];updated[idx]={...updated[idx],msgs:mapped,unread:false};return updated});
    }catch(e){console.log("Load conversation error:",e)}
  };

  const sendGroupMsg=()=>{
    if(!groupInput.trim()||!selCircle)return;
    const nowTs=Date.now();
    setGroupMsgs(p=>[...p,{from:"me",text:groupInput,ts:nowTs,time:fmtTime(new Date())}]);
    api.sendCircleMessage(selCircle.id,groupInput).catch(()=>{});
    setGroupInput("");
  };

  // Load circle group chat messages
  const loadCircleMessages=async(circleId)=>{
    if(!circleId)return;
    try{
      const res=await api.getCircleMessages?.(circleId);
      if(!res){console.log("Circle messages: no response");return}
      const msgs=res?.messages||res?.data||(Array.isArray(res)?res:[]);
      if(!Array.isArray(msgs)){console.log("Circle messages not array:",res);return}
      const mapped=msgs.map(m=>{const mts=m.sent_at||m.created_at||m.createdAt;const parsed=mts?new Date(mts).getTime():Date.now();return{from:m.sender_id===user.id||m.from_me?"me":m.sender_id||"unknown",senderName:m.sender?.username||m.sender?.display_name||"Member",text:m.content||m.text||"",ts:isNaN(parsed)?Date.now():parsed,time:fmtTime(new Date(isNaN(parsed)?Date.now():parsed))}}).sort((a,b)=>a.ts-b.ts);
      setGroupMsgs(mapped);
    }catch(e){console.log("Circle messages load error:",e)}
  };

  // ─── REAL-TIME POLLING ──────────────────────────────────────────
  // 1. Active 1-on-1 chat — refresh every 3s (and immediately on enter)
  useEffect(()=>{
    if(screen!=="chat"||!activeChat)return;
    loadConversation(activeChat);
    const t=setInterval(()=>loadConversation(activeChat),3000);
    return()=>clearInterval(t);
  },[screen,activeChat]);

  // 2. Circle group chat — refresh every 3s (and immediately on enter)
  useEffect(()=>{
    if(screen!=="groupChat"||!selCircle?.id)return;
    loadCircleMessages(selCircle.id);
    const t=setInterval(()=>loadCircleMessages(selCircle.id),3000);
    return()=>clearInterval(t);
  },[screen,selCircle?.id]);

  // 3. Posts feed — refresh every 6s on home/explore/circle (immediate + interval)
  useEffect(()=>{
    if(!user.id)return;
    if(!["home","explore","circle"].includes(screen))return;
    const fetchPosts=()=>{
      api.getPosts().then(res=>{
        const list=Array.isArray(res)?res:(res?.posts||[]);
        if(!Array.isArray(list)){console.log("Posts not array:",res);return}
        setPosts(list.map(p=>{const cts=p.created_at||p.createdAt;const parsed=cts?new Date(cts).getTime():Date.now();return{id:p.id,userId:p.user_id,username:p.user?.username||p.username||"user",avatar:p.user?.avatar_url||"😊",circle:p.circle_tag||"#General",text:p.text||p.body||"",mood:p.mood_value||3,ts:isNaN(parsed)?Date.now():parsed,likes:p.like_count||0,comments:(p.comments||[]).map(c=>({user:c.user?.username||"user",avatar:c.user?.avatar_url||"😊",text:c.text,ts:c.created_at?new Date(c.created_at).getTime():Date.now()}))}}));
      }).catch(e=>console.log("Posts fetch error:",e));
    };
    fetchPosts();
    const t=setInterval(fetchPosts,6000);
    return()=>clearInterval(t);
  },[screen,user.id]);

  // 4. Inbox (DM list) — refresh every 5s globally so unread dot updates everywhere
  useEffect(()=>{
    if(!user.id)return;
    const fetchInbox=()=>{
      api.getInbox().then(inbox=>{
        if(!Array.isArray(inbox)){console.log("Inbox not array:",inbox);return}
        // On msgList screen, also pull each conversation's messages
        if(screen==="msgList"){
          inbox.forEach(c=>{
            const uid=c.other_user_id||c.userId;
            if(uid)loadConversation(uid);
          });
        }
        setConvos(p=>{
          const merged=[...p];
          inbox.forEach(c=>{
            const uid=c.other_user_id||c.userId;
            if(!uid)return;
            const idx=merged.findIndex(x=>x.userId===uid);
            if(idx===-1)merged.push({userId:uid,unread:c.unread_count>0,msgs:[]});
            else merged[idx]={...merged[idx],unread:c.unread_count>0};
          });
          return merged;
        });
      }).catch(e=>console.log("Inbox fetch error:",e));
    };
    fetchInbox();
    const t=setInterval(fetchInbox,5000);
    return()=>clearInterval(t);
  },[screen,user.id]);

  // 5. Notifications — refresh every 10s globally
  useEffect(()=>{
    if(!user.id)return;
    const t=setInterval(()=>{
      api.getNotifications().then(res=>{
        const ns=Array.isArray(res)?res:(res?.notifications||res?.data||[]);
        if(!Array.isArray(ns)){console.log("Notifs not array:",res);return}
        setNotifs(ns.map(n=>{const nts=n.created_at||n.createdAt;const parsed=nts?new Date(nts).getTime():Date.now();return{id:n.id,text:n.content,read:n.is_read,ts:isNaN(parsed)?Date.now():parsed}}));
      }).catch(e=>console.log("Notifs fetch error:",e));
    },10000);
    return()=>clearInterval(t);
  },[user.id]);
  const createCircle=()=>{if(!newCircleName.trim())return;const nc={id:"c"+Date.now(),name:newCircleName,tag:"#"+newCircleName.replace(/\s/g,""),members:1,desc:newCircleDesc||"A new circle.",vis:"public"};setCircles(p=>[...p,nc]);setJoined(p=>[...p,nc.id]);api.createCircle({name:newCircleName,description:newCircleDesc}).then(d=>{if(d?.circle?.id){setCircles(p=>p.map(c=>c.id===nc.id?{...c,id:d.circle.id}:c));setJoined(p=>p.map(id=>id===nc.id?d.circle.id:id))}}).catch(()=>{});setNewCircleName("");setNewCircleDesc("");setShowCreateCircle(false)};
  const saveSettings=()=>{setUser(p=>({...p,name:settingsName,username:settingsUser,phone:settingsPhone,anonymous:settingsAnon}));api.updateMe({display_name:settingsName,username:settingsUser,phone:settingsPhone,is_anonymous:settingsAnon}).catch(()=>{});goBack()};

  const unreadCount=convos.filter(c=>c.unread).length;
  const streak=calcStreak();
  const isMyPost=p=>p.userId==="me"||p.userId===user.id||p.username===user.username;
  const myPostCount=posts.filter(p=>isMyPost(p)).length;

  // ─── Firebase Auth handlers ─────────────────────────────────────
  const validateEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin=async()=>{
    if(!loginEmail.trim()||!loginPw.trim()){setLoginErr("Email and password are required.");return}
    if(!validateEmail(loginEmail)){setLoginErr("Enter a valid email address.");return}
    if(loginPw.length<6){setLoginErr("Password must be at least 6 characters.");return}
    setLoginErr("");setLoading(true);
    try{
      await signInWithEmailAndPassword(auth,loginEmail,loginPw);
      // onAuthStateChanged will handle the rest
    }catch(e){
      const msg=e.code==="auth/user-not-found"?"Not registered. Please create an account first.":e.code==="auth/wrong-password"||e.code==="auth/invalid-credential"?"Incorrect password.":e.code==="auth/too-many-requests"?"Too many attempts. Try again later.":e.message;
      setLoginErr(msg);setLoading(false);
    }
  };

  const handleRegister=async()=>{
    if(!regName.trim()||!regUser.trim()||!regEmail.trim()||!regPw.trim()){setRegErr("All fields are required.");return}
    if(!validateEmail(regEmail)){setRegErr("Enter a valid email address.");return}
    if(regPw.length<6){setRegErr("Password must be at least 6 characters.");return}
    if(regUser.length<3){setRegErr("Username must be at least 3 characters.");return}
    setRegErr("");setLoading(true);
    try{
      const cred=await createUserWithEmailAndPassword(auth,regEmail,regPw);
      // Create profile in our database
      await api.registerProfile({username:regUser,email:regEmail,display_name:regName,firebase_uid:cred.user.uid});
      const me=await api.getMe();
      setUser({id:me.id,name:me.display_name||regName,username:me.username,avatar:"😊",email:me.email,phone:"",anonymous:false,karma:0});
      setSettingsName(regName);setSettingsUser(regUser);
      setLoading(false);setDataLoading(true);tabNav("home");await loadAllData();setDataLoading(false);
    }catch(e){
      const msg=e.code==="auth/email-already-in-use"?"An account with this email already exists.":e.message;
      setRegErr(msg);setLoading(false);
    }
  };

  const handleForgotPassword=async()=>{
    if(!resetEmail.trim()){setResetMsg("Enter your email address.");return}
    if(!validateEmail(resetEmail)){setResetMsg("Enter a valid email address.");return}
    setResetMsg("");setLoading(true);
    try{
      await sendPasswordResetEmail(auth,resetEmail);
      setResetMsg("✓ Password reset email sent! Check your inbox.");
      setLoading(false);
    }catch(e){
      const msg=e.code==="auth/user-not-found"?"No account found with this email.":e.message;
      setResetMsg(msg);setLoading(false);
    }
  };

  const handleGoogleSignIn=async()=>{
    setLoginErr("");setRegErr("");setLoading(true);
    try{
      const result=await signInWithPopup(auth,googleProvider);
      const fbUser=result.user;
      // Try to get existing profile
      try{await api.getMe()}catch(e){
        // Profile doesn't exist yet — create one from Google info
        const username=fbUser.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g,"").slice(0,20)||("user"+Date.now());
        await api.registerProfile({username,email:fbUser.email,display_name:fbUser.displayName||username,firebase_uid:fbUser.uid});
      }
      // onAuthStateChanged will handle loading user data and navigating
      setLoading(false);
    }catch(e){
      const msg=e.code==="auth/popup-closed-by-user"?"Sign-in cancelled.":e.code==="auth/account-exists-with-different-credential"?"An account with this email already exists using a different sign-in method.":e.message;
      setLoginErr(msg);setRegErr(msg);setLoading(false);
    }
  };

  const handleLogout=async()=>{
    try{await signOut(auth)}catch(e){}
    setUser({id:null,name:"",username:"",avatar:"😊",email:"",phone:"",anonymous:false,karma:0});
    setMoodLog([]);setJournals([]);setCircles([]);setPosts([]);setConvos([]);setNotifs([]);setAllUsers([]);
    setJoined([]);setTodayMood(null);setMoodLoggedDate(null);setMoodCounts({1:0,2:0,3:0,4:0,5:0});
    // Clear all form fields
    setLoginEmail("");setLoginPw("");setLoginErr("");
    setRegName("");setRegUser("");setRegEmail("");setRegPw("");setRegErr("");
    setRegMode(false);setShowForgotPw(false);setResetEmail("");setResetMsg("");
    setLoading(false);
    setNavHist([]);setTab("home");setScreen("login");
  };

  // Top contributors sorted by time range (excludes current user)
  const getSortedContributors=()=>{
    const key=tcTimeRange==="week"?"weekKarma":tcTimeRange==="month"?"monthKarma":"karma";
    return[...allUsers].filter(u=>!user.id||u.id!==user.id).sort((a,b)=>b[key]-a[key]);
  };

  // All other users (excluding self) — for DM, search
  const otherUsers=allUsers.filter(u=>!user.id||u.id!==user.id);

  const displayName=u=>{const isMe=!u||u?.id===user.id||u?.username===user.username;return user.anonymous&&isMe?"Anonymous":(u?.name||user.name)};
  const displayUsername=u=>{const isMe=!u||u?.id===user.id||u?.username===user.username;return user.anonymous&&isMe?"anonymous":(u?.username||user.username)};

  // ─── Post Card (comment input uses local state to prevent focus loss) ─
  const PostCard=({p})=>{
    const[localComment,setLocalComment]=useState("");
    const[editing,setEditing]=useState(false);
    const[editText,setEditText]=useState(p.text);
    const doComment=()=>{if(!localComment.trim())return;const isOwnPost=isMyPost(p);setPosts(pp=>pp.map(x=>x.id===p.id?{...x,comments:[...x.comments,{user:user.username,avatar:user.avatar,text:localComment,ts:Date.now()}]}:x));api.addComment(p.id,localComment).catch(()=>{});setLocalComment("")};
    const saveEdit=()=>{if(!editText.trim())return;setPosts(pp=>pp.map(x=>x.id===p.id?{...x,text:editText,editedAt:Date.now()}:x));api.updatePost?.(p.id,{text:editText}).catch(()=>{});setEditing(false)};
    return(
    <div style={{...S.card,marginBottom:12,padding:"16px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{...S.avatarSm,cursor:"pointer"}} onClick={()=>{const u=allUsers.find(x=>x.id===p.userId);if(u){setViewingProfile(u);nav("userProfile")}}}>{p.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <span style={{color:T.text,fontWeight:600,fontSize:13,cursor:"pointer"}} onClick={()=>{const u=allUsers.find(x=>x.id===p.userId);if(u){setViewingProfile(u);nav("userProfile")}}}>{isMyPost(p)?`@${displayUsername()}`:`@${p.username}`}</span>
          <span style={{color:T.textDim,fontSize:11,marginLeft:6}}>{p.circle} · {timeAgo(new Date(p.ts||Date.now()))}{p.editedAt&&" · edited"}</span>
        </div>
        {isMyPost(p)&&!editing&&<button title="Edit" style={{...S.icoBtn,padding:2,marginRight:4,fontSize:14}} onClick={()=>{setEditText(p.text);setEditing(true)}}>✏️</button>}
        {isMyPost(p)&&<button title="Delete" style={{...S.icoBtn,padding:2}} onClick={()=>{if(confirm("Delete this post?")){setPosts(pp=>pp.filter(x=>x.id!==p.id));api.deletePost?.(p.id).catch(()=>{})}}}><Ic.X/></button>}
        <span style={{fontSize:22}}>{MOODS.find(m=>m.value===p.mood)?.emoji}</span>
      </div>
      {editing?(
        <div style={{marginBottom:12}}>
          <textarea style={{...S.textarea,fontSize:13.5,minHeight:80}} value={editText} onChange={e=>setEditText(e.target.value)}/>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button style={{...S.btnSmall,padding:"6px 14px"}} onClick={saveEdit}>Save</button>
            <button style={{...S.btnSmall,padding:"6px 14px",background:T.raised,color:T.textSec}} onClick={()=>setEditing(false)}>Cancel</button>
          </div>
        </div>
      ):(
        <p style={{color:T.text,fontSize:13.5,margin:"0 0 12px",lineHeight:1.55}}>{p.text}</p>
      )}
      <div style={{display:"flex",gap:18}}>
        <button style={S.icoBtn} onClick={()=>toggleLike(p.id)}><Ic.Like on={liked.has(p.id)}/><span style={{marginLeft:5,color:liked.has(p.id)?T.accent:T.textSec,fontSize:12}}>{p.likes}</span></button>
       <button
  style={{...S.icoBtn, transition:"opacity 0.2s"}}
  onClick={()=>setViewingComments(viewingComments===p.id?null:p.id)}
  onMouseOver={e=>e.currentTarget.style.opacity=0.8}
  onMouseOut={e=>e.currentTarget.style.opacity=1}
>
  <Ic.Chat/>
  <span style={{marginLeft:5,color:T.textSec,fontSize:12}}>
    {p.comments?.length||0}
  </span>
</button>
      </div>
      {viewingComments===p.id&&(
       <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
          {(p.comments||[]).map((c,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
              <span style={{fontSize:16}}>{c.avatar}</span>
              <div><span style={{color:T.accent,fontSize:12,fontWeight:600}}>@{c.user}</span><span style={{color:T.textDim,fontSize:10,marginLeft:6}}>{timeAgo(new Date(c.ts||Date.now()))}</span><p style={{color:T.text,fontSize:12.5,margin:"2px 0 0",lineHeight:1.5}}>{c.text}</p></div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input style={{...S.input,flex:1,marginBottom:0,fontSize:12,padding:"8px 12px"}} placeholder="Write a comment..." value={localComment} onChange={e=>setLocalComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doComment()}/>
            <button style={{...S.btnSmall,padding:"6px 12px"}} onClick={doComment}>Post</button>
          </div>
        </div>
      )}
    </div>
  )};

  const MoodRow=({selected,onSelect,size=30,disabled})=>(
    <div style={{display:"flex",justifyContent:"space-around",padding:"4px 0"}}>
      {MOODS.map(m=>(
        <button key={m.value} onClick={()=>!disabled&&onSelect(m)} style={{
          background:"none",border:selected===m.value?`2px solid ${m.color}`:"2px solid transparent",
          borderRadius:14,padding:5,cursor:disabled?"default":"pointer",transition:"all .15s",
          transform:selected===m.value?"scale(1.2)":"scale(1)",opacity:disabled&&selected!==m.value?0.3:selected&&selected!==m.value?0.4:1,
        }}><span style={{fontSize:size}}>{m.emoji}</span></button>
      ))}
    </div>
  );

  // ─── Loading screen while checking auth ─────────────────────────
  if(!authChecked||dataLoading)return(<div style={{...S.shell}}><div style={{...S.phone,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:10}}>🌿</div><h1 style={{fontSize:28,fontWeight:900,color:T.accent,margin:"0 0 8px",fontFamily:"'Outfit',sans-serif",letterSpacing:-1}}>Ease-On</h1><p style={{color:T.textSec,fontSize:13,margin:"0 0 20px"}}>Your community wellness companion</p><div style={{display:"flex",justifyContent:"center",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:4,background:T.accent,animation:`pulse 1.2s ${i*0.2}s infinite`,opacity:0.4}}/>)}</div><style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`}</style></div></div></div>);

  // ═══════════════════════════════════════════════════════════════════
  const renderScreen=()=>{
    // ── LOGIN ──────────────────────────────────────────────────────
    if(screen==="login"){
      return(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"0 24px"}}>
          <div style={{width:"100%",maxWidth:340}}>
            <div style={{textAlign:"center",marginBottom:44}}>
              <div style={{fontSize:52,marginBottom:6}}>🌿</div>
              <h1 style={{fontSize:38,fontWeight:900,color:T.accent,margin:0,fontFamily:"'Outfit',sans-serif",letterSpacing:-1.5}}>Ease-On</h1>
              <p style={{color:T.textSec,marginTop:6,fontSize:13}}>Your community wellness companion</p>
            </div>
            {showForgotPw?(<>
              <p style={{color:T.text,fontWeight:600,fontSize:16,marginBottom:12}}>Reset Password</p>
              <p style={{color:T.textSec,fontSize:13,marginBottom:16}}>Enter your email and we'll send you a link to reset your password.</p>
              <input style={S.input} placeholder="Email address" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleForgotPassword()}/>
              {resetMsg&&<p style={{color:resetMsg.startsWith("✓")?T.accent:T.danger,fontSize:12,marginBottom:10}}>{resetMsg}</p>}
              <button style={{...S.btnFull,opacity:loading?0.6:1}} onClick={handleForgotPassword} disabled={loading}>{loading?"Sending...":"Send Reset Link"}</button>
              <p style={{textAlign:"center",color:T.textSec,marginTop:18,fontSize:13}}><span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>{setShowForgotPw(false);setResetMsg("")}}>← Back to Login</span></p>
            </>):!regMode?(<>
              <input style={S.input} placeholder="Email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/>
              <input style={S.input} placeholder="Password (min 6 chars)" type="password" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              {loginErr&&<p style={{color:T.danger,fontSize:12,marginBottom:10}}>{loginErr}</p>}
              <button style={{...S.btnFull,opacity:loading?0.6:1}} onClick={handleLogin} disabled={loading}>{loading?"Logging in...":"Log In"}</button>
              {!isNativeApp&&<><div style={{display:"flex",alignItems:"center",gap:12,margin:"14px 0"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{color:T.textDim,fontSize:12}}>or</span><div style={{flex:1,height:1,background:T.border}}/></div>
              <button style={{...S.btnOutline,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={handleGoogleSignIn} disabled={loading}><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.77-4.59l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.35 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</button></>}
              <p style={{textAlign:"center",color:T.textSec,marginTop:18,fontSize:13}}>Don't have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>{setRegMode(true);setLoginErr("")}}>Register</span></p>
              <p style={{textAlign:"center",marginTop:8}}><span style={{color:T.textDim,fontSize:12,cursor:"pointer"}} onClick={()=>{setShowForgotPw(true);setResetEmail(loginEmail);setResetMsg("")}}>Forgot password?</span></p>
            </>):(<>
              <input style={S.input} placeholder="Full Name *" value={regName} onChange={e=>setRegName(e.target.value)}/>
              <input style={S.input} placeholder="Username (min 3 chars) *" value={regUser} onChange={e=>setRegUser(e.target.value)}/>
              <input style={S.input} placeholder="Email *" value={regEmail} onChange={e=>setRegEmail(e.target.value)}/>
              <input style={S.input} placeholder="Password (min 6 chars) *" type="password" value={regPw} onChange={e=>setRegPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleRegister()}/>
              {regErr&&<p style={{color:T.danger,fontSize:12,marginBottom:10}}>{regErr}</p>}
              <button style={{...S.btnFull,opacity:loading?0.6:1}} onClick={handleRegister} disabled={loading}>{loading?"Creating account...":"Register"}</button>
              {!isNativeApp&&<><div style={{display:"flex",alignItems:"center",gap:12,margin:"18px 0"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{color:T.textDim,fontSize:12}}>or</span><div style={{flex:1,height:1,background:T.border}}/></div>
              <button style={{...S.btnOutline,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={handleGoogleSignIn} disabled={loading}><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.77-4.59l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.35 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</button></>}
              <p style={{textAlign:"center",color:T.textSec,marginTop:18,fontSize:13}}>Already have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>{setRegMode(false);setRegErr("")}}>Log In</span></p>
            </>)}
          </div>
        </div>
      );
    }

    // ── HOME ──────────────────────────────────────────────────────
    if(screen==="home"){
      const now=new Date();
      const week=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-now.getDay()+i);return{n:dayNames[i],d:d.getDate(),today:d.toDateString()===now.toDateString()}});
      const alreadyLogged=moodLoggedDate===todayStr();
      // New user check — no posts, no journals, no moods, no circles
      const isNewUser=posts.length===0&&journals.length===0&&moodLog.length===0&&joined.length===0;
      return(<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h1 style={{fontSize:26,fontWeight:700,color:T.text,margin:0,fontFamily:"'Outfit',sans-serif"}}>Hi, {displayName()}</h1>
          <div style={{display:"flex",gap:10}}>
            <button style={S.icoBtn} onClick={()=>nav("notifs")}><Ic.Bell dot={notifs.some(n=>!n.read)}/></button>
            <button style={S.icoBtn} onClick={()=>nav("msgList")}><Ic.Msg dot={unreadCount>0}/></button>
          </div>
        </div>

        {showNotifBanner&&<div style={{...S.card,marginBottom:14,padding:14,border:`1px solid ${T.accent}44`,background:`${T.accent}11`,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:24}}>🔔</span>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontWeight:600,fontSize:13}}>Enable notifications</div>
            <div style={{color:T.textSec,fontSize:11,marginTop:2}}>Get reminders for mood check-ins and journal entries</div>
          </div>
          <button style={{...S.btnSmall,padding:"6px 12px",fontSize:11}} onClick={()=>{requestNotificationPermission();setShowNotifBanner(false);setNotifBannerDismissed(true)}}>Enable</button>
          <button style={{...S.icoBtn,padding:2}} onClick={()=>{setShowNotifBanner(false);setNotifBannerDismissed(true)}}><Ic.X/></button>
        </div>}

        {/* New-user welcome — only shows for brand new accounts */}
        {isNewUser&&<div style={{...S.card,marginBottom:14,padding:18,textAlign:"center",border:`1px solid ${T.accent}44`,background:`${T.accent}08`}}>
          <div style={{fontSize:36,marginBottom:8}}>🌿</div>
          <div style={{color:T.text,fontWeight:700,fontSize:16,marginBottom:6}}>Welcome to Ease-On!</div>
          <div style={{color:T.textSec,fontSize:13,lineHeight:1.5,marginBottom:14}}>This is your community wellness companion. Get started by:</div>
          <div style={{textAlign:"left",display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            <div style={{color:T.text,fontSize:12,display:"flex",gap:8}}><span>1.</span><span>Logging your mood below</span></div>
            <div style={{color:T.text,fontSize:12,display:"flex",gap:8}}><span>2.</span><span>Writing your first journal entry</span></div>
            <div style={{color:T.text,fontSize:12,display:"flex",gap:8}}><span>3.</span><span>Joining a support circle on the Explore tab</span></div>
            <div style={{color:T.text,fontSize:12,display:"flex",gap:8}}><span>4.</span><span>Sharing your first post when you're ready</span></div>
          </div>
        </div>}

        {(!loggedToday||!journaledToday)&&!isNewUser&&<div style={{...S.card,marginBottom:14,padding:14,border:`1px solid ${T.accent}33`,background:`${T.accent}08`}}>
          <div style={{color:T.text,fontWeight:600,fontSize:13,marginBottom:8}}>✨ Today's Check-in</div>
          <div style={{display:"flex",gap:8,flexDirection:"column"}}>
            {!loggedToday&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.textSec}}><span>○</span><span>Log your mood</span></div>}
            {loggedToday&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.accent}}><span>✓</span><span>Mood logged</span></div>}
            {!journaledToday&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.textSec,cursor:"pointer"}} onClick={()=>{setEditJ(null);setJText("");setJMood(null);setJVis("private");nav("jEntry")}}><span>○</span><span>Write a journal entry</span></div>}
            {journaledToday&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.accent}}><span>✓</span><span>Journal entry added</span></div>}
          </div>
        </div>}

        {happyMemory&&(()=>{
          const happyDateStr=new Date(happyMemory.date).toDateString();
          const happyJournal=journals.find(j=>{const d=j.date instanceof Date?j.date:new Date(j.date);return d.toDateString()===happyDateStr});
          return(
          <div style={{...S.card,marginBottom:14,padding:14,border:`1px solid ${T.accent}44`,background:`${T.accent}11`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{color:T.accent,fontWeight:600,fontSize:13}}>💛 Remember this day?</span><button style={S.icoBtn} onClick={()=>setHappyMemory(null)}><Ic.X/></button></div>
            <p style={{color:T.text,fontSize:12,margin:"0 0 8px"}}>On {fmtDate(happyMemory.date)}, you logged <strong>{MOODS.find(m=>m.value===happyMemory.value)?.label}</strong> {MOODS.find(m=>m.value===happyMemory.value)?.emoji}. Better days are always ahead.</p>
            {happyJournal&&<div style={{padding:"10px 12px",background:T.surface,borderRadius:8,border:`1px solid ${T.border}`,marginTop:8}}>
              <div style={{color:T.textSec,fontSize:10,fontWeight:600,marginBottom:4}}>YOUR JOURNAL FROM THAT DAY</div>
              <p style={{color:T.text,fontSize:12,margin:0,lineHeight:1.5,fontStyle:"italic"}}>"{happyJournal.text.length>180?happyJournal.text.substring(0,180)+"...":happyJournal.text}"</p>
            </div>}
          </div>
          );
        })()}

        {/* Quick mood logger — compact version */}
        {!alreadyLogged&&<div style={{...S.card,padding:"14px 16px 16px",marginBottom:14}}>
          <p style={{color:T.text,fontWeight:600,fontSize:14,margin:"0 0 10px"}}>How are you feeling today?</p>
          <MoodRow selected={todayMood} onSelect={logMood} disabled={alreadyLogged}/>
        </div>}

        {/* MAIN: Community feed — posts from circles you've joined or all if none joined */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{color:T.text,fontWeight:600,fontSize:15,margin:0}}>Community Feed</p>
            <span style={{color:T.accent,fontSize:13,cursor:"pointer",fontWeight:500}} onClick={()=>tabNav("explore")}>Explore</span>
          </div>
          {(()=>{
            // Show posts from circles you've joined first; if none joined, show all
            const joinedTags=circles.filter(c=>joined.includes(c.id)).map(c=>c.tag.toLowerCase());
            const feedPosts=joinedTags.length>0?posts.filter(p=>joinedTags.includes((p.circle||"").toLowerCase())):posts;
            if(feedPosts.length===0)return(<div style={{...S.card,padding:24,textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>📭</div>
              <div style={{color:T.text,fontSize:13,fontWeight:600,marginBottom:4}}>{joinedTags.length===0?"Your feed is empty":"No posts in your circles yet"}</div>
              <div style={{color:T.textSec,fontSize:12}}>{joinedTags.length===0?"Join a circle on the Explore tab to see posts":"Be the first to share something!"}</div>
            </div>);
            return feedPosts.slice(0,15).map(p=><PostCard key={p.id} p={p}/>);
          })()}
        </div>

        <button style={S.fab} onClick={()=>nav("createPost")}><Ic.Plus/></button>
      </>);
    }

    // ── TOP CONTRIBUTORS ─────────────────────────────────────────
    if(screen==="topContributors"){
      const sorted=getSortedContributors();const karmaKey=tcTimeRange==="week"?"weekKarma":tcTimeRange==="month"?"monthKarma":"karma";
      return(<>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Top Contributors" right={<Ic.Trophy/>}/>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[{k:"all",l:"All Time"},{k:"month",l:"This Month"},{k:"week",l:"This Week"}].map(f=><Pill key={f.k} active={tcTimeRange===f.k} onClick={()=>setTcTimeRange(f.k)} s={{padding:"6px 14px",fontSize:12}}>{f.l}</Pill>)}
        </div>
        {sorted.length>=3&&<div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:8,marginBottom:24,padding:"0 10px"}}>
          {[sorted[1],sorted[0],sorted[2]].map((u,i)=>{const heights=[120,150,100];const medals=["🥈","🥇","🥉"];const colors=[T.silver,T.gold,T.bronze];return(
            <div key={u.id} style={{flex:1,textAlign:"center",cursor:"pointer"}} onClick={()=>{setViewingProfile(u);nav("userProfile")}}>
              <div style={{fontSize:32,marginBottom:6}}>{u.avatar}</div>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>{u.name}</div>
              <div style={{height:heights[i],background:`linear-gradient(to top, ${colors[i]}22, ${colors[i]}44)`,borderRadius:"12px 12px 0 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:12,border:`1px solid ${colors[i]}44`}}>
                <span style={{fontSize:24}}>{medals[i]}</span>
                <div style={{color:colors[i],fontWeight:900,fontSize:18,fontFamily:"'Outfit',sans-serif",marginTop:4}}>{medals[i]}</div>
                <div style={{color:T.textSec,fontSize:10,marginTop:2}}>rank</div>
              </div>
            </div>
          )})}
        </div>}
        {sorted.map((u,i)=>(
          <div key={u.id} onClick={()=>{setViewingProfile(u);nav("userProfile")}} style={{...S.card,marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontWeight:900,fontSize:15,color:i<3?[T.gold,T.silver,T.bronze][i]:T.textDim,width:26,textAlign:"center",fontFamily:"'Outfit',sans-serif"}}>#{i+1}</span>
            <div style={S.avatarSm}>{u.avatar}</div>
            <div style={{flex:1}}><div style={{color:T.text,fontWeight:600,fontSize:13}}>{u.name}</div><div style={{color:T.textSec,fontSize:11}}>@{u.username}</div></div>
            <button style={S.btnSmall} onClick={e=>{e.stopPropagation();startNewDm(u.id)}}>DM</button>
          </div>
        ))}
      </>);
    }

    // ── USER PROFILE ─────────────────────────────────────────────
    if(screen==="userProfile"){
      if(!viewingProfile)return null;
      const u=viewingProfile;
      const uPosts=posts.filter(p=>p.userId===u.id||p.username===u.username);
      // Find all comments this user made on any post
      const uComments=[];
      posts.forEach(p=>{(p.comments||[]).forEach(c=>{if(c.user===u.username)uComments.push({...c,postId:p.id,postText:p.text,postAuthor:p.username,postMood:p.mood})})});
      uComments.sort((a,b)=>(b.ts||0)-(a.ts||0));
      // Public journal entries belonging to this user
      // Note: For other users, journals must be fetched from backend. For self, use local state.
      const uJournals=u.id===user.id
        ?journals.filter(j=>j.vis==="public").sort((a,b)=>b.date-a.date)
        :(viewingProfile.publicJournals||[]).sort((a,b)=>new Date(b.date)-new Date(a.date));
      return(<>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>}/>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:80,height:80,borderRadius:40,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,border:`2px solid ${T.accent}`,margin:"0 auto"}}>{u.avatar}</div>
          <div style={{color:T.text,fontWeight:700,fontSize:22,marginTop:10}}>{u.name}</div>
          <div style={{color:T.textSec,fontSize:13}}>@{u.username}</div>
          <div style={{display:"flex",justifyContent:"center",gap:30,marginTop:14}}>
            <div style={{textAlign:"center"}}><div style={{color:T.text,fontWeight:800,fontSize:20}}>{uPosts.length}</div><div style={{color:T.textSec,fontSize:11}}>Posts</div></div>
            <div style={{textAlign:"center"}}><div style={{color:T.text,fontWeight:800,fontSize:20}}>{uComments.length}</div><div style={{color:T.textSec,fontSize:11}}>Comments</div></div>
            <div style={{textAlign:"center"}}><div style={{color:T.text,fontWeight:800,fontSize:20}}>{uJournals.length}</div><div style={{color:T.textSec,fontSize:11}}>Journal</div></div>
          </div>
          <button style={{...S.btnFull,marginTop:16,maxWidth:220,marginLeft:"auto",marginRight:"auto"}} onClick={()=>startNewDm(u.id)}>Send Direct Message</button>
        </div>
        <div style={{display:"flex",background:T.raised,borderRadius:10,overflow:"hidden",marginBottom:16}}>
          {["posts","comments","journal"].map(t=><button key={t} onClick={()=>setProfileTab(t)} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:profileTab===t?T.accent:"transparent",color:profileTab===t?"#fff":T.textSec,borderRadius:profileTab===t?10:0}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>
        {profileTab==="posts"&&(uPosts.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:40}}><p style={{fontSize:36}}>📝</p><p>No posts yet</p></div>:uPosts.map(p=><PostCard key={p.id} p={p}/>))}
        {profileTab==="comments"&&(uComments.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:40}}><p style={{fontSize:36}}>💬</p><p>No comments yet</p></div>:uComments.map((c,i)=>(
          <div key={i} onClick={()=>{const p=posts.find(x=>x.id===c.postId);if(p){setViewingComments(p.id);goBack()}}} style={{...S.card,marginBottom:10,padding:"12px 14px",cursor:"pointer"}}>
            <div style={{color:T.textDim,fontSize:11,marginBottom:6}}>Commented on @{c.postAuthor}'s post · {timeAgo(new Date(c.ts||Date.now()))}</div>
            <p style={{color:T.textSec,fontSize:12,margin:"0 0 8px",lineHeight:1.4,fontStyle:"italic",borderLeft:`2px solid ${T.border}`,paddingLeft:8}}>"{c.postText.length>80?c.postText.substring(0,80)+"...":c.postText}"</p>
            <p style={{color:T.text,fontSize:13,margin:0,lineHeight:1.5}}>{c.text}</p>
          </div>
        )))}
        {profileTab==="journal"&&(uJournals.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:40}}><p style={{fontSize:36}}>📔</p><p>No public journal entries</p></div>:uJournals.map(j=>(
          <div key={j.id} style={{...S.card,marginBottom:10,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:20}}>{MOODS.find(m=>m.value===j.mood)?.emoji||"😐"}</span>
              <div style={{flex:1}}>
                <div style={{color:T.textSec,fontSize:12}}>{fmtDate(j.date)} · {fmtTime(j.date)}</div>
                {j.editedAt&&<div style={{color:T.textDim,fontSize:10,fontStyle:"italic"}}>edited {fmtDate(j.editedAt)}</div>}
              </div>
              <span style={{fontSize:9,color:T.accent,background:T.accentGlow,padding:"3px 8px",borderRadius:6,fontWeight:600}}>🌐 public</span>
            </div>
            <p style={{color:T.text,fontSize:13,margin:0,lineHeight:1.5}}>{j.text}</p>
          </div>
        )))}
      </>);
    }

    // ── MESSAGES LIST ────────────────────────────────────────────
    if(screen==="msgList"){
      const filteredUsers=otherUsers.filter(u=>u.name.toLowerCase().includes(dmSearch.toLowerCase())||u.username.toLowerCase().includes(dmSearch.toLowerCase()));
      return(<>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Messages" right={<button style={S.icoBtn} onClick={()=>setShowNewDm(!showNewDm)}><Ic.Compose/></button>}/>
        {showNewDm&&<div style={{...S.card,marginBottom:16,padding:14}}>
          <p style={{color:T.text,fontWeight:600,fontSize:14,margin:"0 0 10px"}}>New Message</p>
          <input style={S.input} placeholder="Search users..." value={dmSearch} onChange={e=>setDmSearch(e.target.value)} autoFocus/>
          <div style={{maxHeight:200,overflowY:"auto"}}>{(dmSearch?filteredUsers:otherUsers.slice(0,5)).map(u=>(
            <div key={u.id} onClick={()=>startNewDm(u.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 4px",cursor:"pointer",borderRadius:8}}>
              <div style={S.avatarSm}>{u.avatar}</div>
              <div style={{flex:1}}><div style={{color:T.text,fontSize:13,fontWeight:600}}>{u.name}</div><div style={{color:T.textSec,fontSize:11}}>@{u.username}</div></div>
            </div>
          ))}</div>
        </div>}
        {convos.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:60}}><p style={{fontSize:36}}>💬</p><p>No conversations yet</p></div>
        :convos.map(c=>{const u=allUsers.find(x=>x.id===c.userId);if(!u)return null;const last=c.msgs[c.msgs.length-1];
          return(<div key={c.userId} onClick={()=>openChat(c.userId)} style={{...S.card,marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:c.unread?`1px solid ${T.accent}33`:`1px solid ${T.border}`}}>
            <div style={S.avatarMd}>{u.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.text,fontWeight:c.unread?700:500,fontSize:14}}>{u.name}</span>{last&&<span style={{color:c.unread?T.accent:T.textDim,fontSize:10}}>{last.date}</span>}</div>
              {last&&<div style={{color:c.unread?T.text:T.textSec,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>{last.from==="me"?"You: ":""}{last.text}</div>}
            </div>
            {c.unread&&<div style={{width:10,height:10,borderRadius:5,background:T.accent,flexShrink:0}}/>}
          </div>);
        })}
      </>);
    }

    // ── CHAT ─────────────────────────────────────────────────────
    if(screen==="chat"){
      const convo=convos.find(c=>c.userId===activeChat);const other=allUsers.find(u=>u.id===activeChat);
      if(!convo||!other)return null;
      return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexShrink:0}}>
          <button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>
          <div style={S.avatarSm}>{other.avatar}</div>
          <div style={{flex:1}}><div style={{color:T.text,fontWeight:600,fontSize:14}}>{other.name}</div><div style={{color:T.textSec,fontSize:11}}>@{other.username}</div></div>
        </div>
        <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
          {convo.msgs.length===0&&<div style={{textAlign:"center",marginTop:40}}><div style={{fontSize:48,marginBottom:10}}>{other.avatar}</div><p style={{color:T.textSec,fontSize:13}}>Start the conversation!</p></div>}
          {convo.msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",marginBottom:6}}>
              <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:16,background:m.from==="me"?T.accent:T.card,borderBottomRightRadius:m.from==="me"?4:16,borderBottomLeftRadius:m.from==="me"?16:4}}>
                <p style={{color:m.from==="me"?"#fff":T.text,fontSize:13,margin:0,lineHeight:1.45}}>{m.text}</p>
                <p style={{fontSize:10,color:m.from==="me"?"rgba(255,255,255,.55)":T.textDim,margin:"3px 0 0",textAlign:"right"}}>{m.time}</p>
              </div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>
        <div style={{display:"flex",gap:8,paddingTop:8,flexShrink:0}}>
          <input style={{...S.input,flex:1,marginBottom:0}} placeholder={`Message ${other.name}...`} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/>
          <button style={{...S.icoBtn,background:T.card,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={sendMsg}><Ic.Send/></button>
        </div>
      </div>);
    }

    // ── EXPLORE ──────────────────────────────────────────────────
    if(screen==="explore"){
      return(<>
        <TopBar title="Explore Circles" right={<button style={S.btnSmall} onClick={()=>setShowCreateCircle(true)}>+ New</button>}/>
        {showCreateCircle&&<div style={{...S.card,marginBottom:16,padding:16}}><input style={S.input} placeholder="Circle name" value={newCircleName} onChange={e=>setNewCircleName(e.target.value)}/><input style={S.input} placeholder="Description" value={newCircleDesc} onChange={e=>setNewCircleDesc(e.target.value)}/><div style={{display:"flex",gap:8}}><button style={S.btnSmall} onClick={createCircle}>Create</button><button style={{...S.btnSmall,background:T.raised,color:T.textSec}} onClick={()=>setShowCreateCircle(false)}>Cancel</button></div></div>}
        {circles.map(c=>{const m=joined.includes(c.id);return(<div key={c.id} style={{...S.card,marginBottom:12,padding:16}}><div style={{display:"flex",alignItems:"flex-start",gap:12}}><div style={{width:44,height:44,borderRadius:22,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.Users/></div><div style={{flex:1}}><div style={{color:T.text,fontWeight:700,fontSize:15}}>{c.name}</div><div style={{color:T.textSec,fontSize:12}}>{c.tag} · {c.members} members</div><div style={{color:T.textDim,fontSize:12,marginTop:4}}>{c.desc}</div></div></div><div style={{display:"flex",gap:8,marginTop:12}}><Pill active={!m} onClick={()=>{if(m){setJoined(p=>p.filter(id=>id!==c.id));api.leaveCircle(c.id).catch(()=>{})}else{setJoined(p=>[...p,c.id]);api.joinCircle(c.id).catch(()=>{})}}}>{m?"Joined ✓":"Join Circle"}</Pill><Pill onClick={()=>{setSelCircle(c);nav("circleDetail")}}>View</Pill></div></div>)})}
        {posts.length>0&&<><p style={{color:T.text,fontWeight:600,fontSize:15,margin:"20px 0 10px"}}>Recent Posts</p>{posts.slice(0,4).map(p=><PostCard key={p.id} p={p}/>)}</>}
      </>);
    }

    // ── CIRCLE DETAIL ────────────────────────────────────────────
    if(screen==="circleDetail"){
      if(!selCircle)return null;const cp=posts.filter(p=>p.circle===selCircle.tag);const m=joined.includes(selCircle.id);
      return(<>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title={selCircle.name}/>
        <p style={{color:T.textSec,fontSize:13,margin:"-10px 0 6px"}}>{selCircle.tag} · {selCircle.members} members</p>
        <p style={{color:T.textDim,fontSize:13,marginBottom:14}}>{selCircle.desc}</p>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <Pill active={!m} onClick={()=>{if(m){setJoined(p=>p.filter(id=>id!==selCircle.id));api.leaveCircle(selCircle.id).catch(()=>{})}else{setJoined(p=>[...p,selCircle.id]);api.joinCircle(selCircle.id).catch(()=>{})}}}>{m?"Leave Circle":"Join Circle"}</Pill>
          {m&&<Pill onClick={()=>{nav("groupChat");if(selCircle?.id)loadCircleMessages(selCircle.id)}}>Group Chat</Pill>}
          {m&&<Pill onClick={()=>{setNewPostCircles([selCircle.tag]);setNewCircleInput("");setNewPostText("");setNewPostMood(null);nav("createPost")}} s={{background:T.accent,color:"#fff"}}>+ Post</Pill>}
        </div>
        <p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Circle Feed</p>
        {cp.length===0?<p style={{color:T.textDim,textAlign:"center",marginTop:30,fontSize:13}}>No posts yet — be the first!</p>:cp.map(p=><PostCard key={p.id} p={p}/>)}
      </>);
    }

    // ── JOURNAL ──────────────────────────────────────────────────
    if(screen==="journal"){
      return(<>
        <TopBar title="Journal"/>
        {journals.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:60}}><p style={{fontSize:36}}>📝</p><p>No journal entries yet</p></div>
        :journals.sort((a,b)=>b.date-a.date).map(j=><div key={j.id} onClick={()=>{setEditJ(j);setJText(j.text);setJMood(j.mood);setJVis(j.vis||"private");nav("jEntry")}} style={{...S.card,marginBottom:10,padding:"12px 14px",cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:22}}>{MOODS.find(m=>m.value===j.mood)?.emoji||"😐"}</span><div style={{flex:1}}><div style={{color:T.textSec,fontSize:12}}>{fmtDate(j.date)} · {fmtTime(j.date)}</div>{j.editedAt&&<div style={{color:T.textDim,fontSize:10,fontStyle:"italic"}}>edited {fmtDate(j.editedAt)} · {fmtTime(j.editedAt)}</div>}</div><span style={{fontSize:9,color:j.vis==="public"?T.accent:T.textDim,background:j.vis==="public"?T.accentGlow:T.raised,padding:"3px 8px",borderRadius:6,fontWeight:600}}>{j.vis==="public"?"🌐 public":"🔒 private"}</span></div><p style={{color:T.text,fontSize:13,margin:0,lineHeight:1.5}}>{j.text}</p></div>)}
        <button style={S.fab} onClick={()=>{setEditJ(null);setJText("");setJMood(null);setJVis("private");nav("jEntry")}}><Ic.Plus/></button>
      </>);
    }

    // ── JOURNAL ENTRY ───────────────────────────────────────────
    if(screen==="jEntry"){
      return(<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><button style={{...S.icoBtn,color:T.textSec,fontSize:15,fontFamily:"inherit"}} onClick={goBack}>Cancel</button><button style={{...S.icoBtn,color:T.accent,fontSize:15,fontWeight:700,fontFamily:"inherit"}} onClick={saveJournal}>Save</button></div>
        <p style={{color:T.text,fontWeight:600,fontSize:16,marginBottom:8}}>What's Happening?</p>
        <textarea style={S.textarea} rows={8} placeholder="Write your thoughts..." value={jText} onChange={e=>setJText(e.target.value)}/>
        <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:22,marginBottom:10}}>Feeling:</p>
        <MoodRow selected={jMood} onSelect={m=>setJMood(m.value)} size={28}/>
        <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:22,marginBottom:10}}>Visibility</p>
        <div style={{display:"flex",background:T.raised,borderRadius:10,overflow:"hidden"}}>
          {[{k:"private",l:"🔒 Private",d:"Only you can see this"},{k:"public",l:"🌐 Public",d:"Share with the community"}].map(v=><button key={v.k} onClick={()=>setJVis(v.k)} style={{flex:1,padding:"11px 8px",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:jVis===v.k?T.accent:"transparent",color:jVis===v.k?"#fff":T.textSec}}>{jVis===v.k&&"✓ "}{v.l}</button>)}
        </div>
        <p style={{color:T.textDim,fontSize:11,marginTop:8,lineHeight:1.4}}>{jVis==="public"?"This entry will be visible to other users on your profile.":"Only visible to you. Shown on your profile but hidden from others."}</p>
        {editJ&&<button style={{...S.btnOutline,marginTop:24,borderColor:T.danger,color:T.danger}} onClick={()=>{setJournals(p=>p.filter(j=>j.id!==editJ.id));api.deleteJournal(editJ.id).catch(()=>{});goBack()}}>Delete Entry</button>}
      </>);
    }

    // ── CREATE POST ─────────────────────────────────────────────
    if(screen==="createPost"){
      const addCircleTag=(raw)=>{const t=raw.trim();if(!t)return;const tag=t.startsWith("#")?t:"#"+t.replace(/\s/g,"");if(!newPostCircles.find(x=>x.toLowerCase()===tag.toLowerCase()))setNewPostCircles(p=>[...p,tag]);setNewCircleInput("")};
      const removeCircleTag=tag=>setNewPostCircles(p=>p.filter(x=>x!==tag));
      return(<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><button style={{...S.icoBtn,color:T.textSec,fontSize:15,fontFamily:"inherit"}} onClick={goBack}>Cancel</button><button style={{...S.icoBtn,color:T.accent,fontSize:15,fontWeight:700,fontFamily:"inherit"}} onClick={createPost}>Post</button></div>
        <label style={S.label}>Circles (post to one or more)</label>
        {newPostCircles.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {newPostCircles.map(tag=><div key={tag} style={{display:"flex",alignItems:"center",gap:4,background:T.accentGlow,color:T.accent,padding:"4px 10px",borderRadius:14,fontSize:12,fontWeight:600,border:`1px solid ${T.accent}44`}}>
            {tag}
            <span style={{cursor:"pointer",fontSize:16,lineHeight:1,marginLeft:2}} onClick={()=>removeCircleTag(tag)}>×</span>
          </div>)}
        </div>}
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <input style={{...S.input,flex:1,marginBottom:0}} placeholder="Type circle name (e.g. general)" value={newCircleInput} onChange={e=>setNewCircleInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addCircleTag(newCircleInput))}/>
          <button style={{...S.btnSmall,padding:"10px 16px"}} onClick={()=>addCircleTag(newCircleInput)}>Add</button>
        </div>
        {circles.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {circles.slice(0,8).map(c=>{const isSel=newPostCircles.find(x=>x.toLowerCase()===c.tag.toLowerCase());return(
            <button key={c.id} onClick={()=>isSel?removeCircleTag(c.tag):addCircleTag(c.tag)} style={{border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:14,fontSize:11,fontWeight:600,background:isSel?T.accent:T.raised,color:isSel?"#fff":T.textSec,fontFamily:"inherit"}}>{c.tag}</button>
          )})}
        </div>}
        <p style={{color:T.text,fontWeight:600,fontSize:16,marginTop:12,marginBottom:8}}>What's Happening?</p><textarea style={S.textarea} rows={6} placeholder="Share your thoughts..." value={newPostText} onChange={e=>setNewPostText(e.target.value)}/>
        <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:22,marginBottom:10}}>Feeling:</p><MoodRow selected={newPostMood} onSelect={m=>setNewPostMood(m.value)} size={28}/>
        <p style={{color:T.text,fontWeight:600,fontSize:14,marginTop:24,marginBottom:10}}>Audience</p>
        <div style={{display:"flex",background:T.raised,borderRadius:10,overflow:"hidden"}}>{["public","private"].map(a=><button key={a} onClick={()=>setNewPostAud(a)} style={{flex:1,padding:"11px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:newPostAud===a?T.accent:"transparent",color:newPostAud===a?"#fff":T.textSec}}>{newPostAud===a&&"✓ "}{a.charAt(0).toUpperCase()+a.slice(1)}</button>)}</div>
      </>);
    }

    // ── SEARCH ───────────────────────────────────────────────────
    if(screen==="search"){
      const fp=posts.filter(p=>!query||p.text.toLowerCase().includes(query.toLowerCase())||p.circle.toLowerCase().includes(query.toLowerCase()));
      const fc=circles.filter(c=>!query||c.name.toLowerCase().includes(query.toLowerCase())||c.tag.toLowerCase().includes(query.toLowerCase()));
      const fu=query?otherUsers.filter(u=>u.name.toLowerCase().includes(query.toLowerCase())||u.username.toLowerCase().includes(query.toLowerCase())):[];
      return(<>
        <TopBar title="Search"/><input style={S.input} placeholder="Search posts, circles, users..." value={query} onChange={e=>setQuery(e.target.value)}/>
        {fu.length>0&&<><p style={S.sectionLabel}>USERS</p>{fu.map(u=><div key={u.id} onClick={()=>{setViewingProfile(u);nav("userProfile")}} style={{...S.card,marginBottom:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><div style={S.avatarSm}>{u.avatar}</div><div style={{flex:1}}><div style={{color:T.text,fontSize:13,fontWeight:600}}>{u.name}</div><div style={{color:T.textSec,fontSize:11}}>@{u.username}</div></div></div>)}</>}
        {!query&&circles.length>0&&<p style={S.sectionLabel}>CIRCLES</p>}
        {fc.slice(0,query?10:4).map(c=><div key={c.id} onClick={()=>{setSelCircle(c);nav("circleDetail")}} style={{...S.card,marginBottom:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}><span>🤝</span><span style={{color:T.text,fontSize:14}}>{c.tag}</span><span style={{color:T.textSec,fontSize:11,marginLeft:"auto"}}>{c.members} members</span></div>)}
        {posts.length>0&&<p style={S.sectionLabel}>{query?"MATCHING POSTS":"RECENT POSTS"}</p>}
        {fp.slice(0,query?10:3).map(p=><PostCard key={p.id} p={p}/>)}
        {query&&fp.length===0&&fc.length===0&&fu.length===0&&<p style={{color:T.textDim,textAlign:"center",marginTop:20}}>No results</p>}
      </>);
    }

    // ── PROFILE ──────────────────────────────────────────────────
    if(screen==="profile"){
      const mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date().getMonth()];
      const daysActive=new Set(moodLog.map(m=>m.date.toDateString())).size;
      return(<>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button style={S.icoBtn} onClick={()=>{setSettingsName(user.name);setSettingsUser(user.username);setSettingsPhone(user.phone);setSettingsAnon(user.anonymous);nav("settings")}}><Ic.Menu/></button></div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{position:"relative",display:"inline-block",cursor:"pointer"}} onClick={()=>setShowAvatarPicker(!showAvatarPicker)}>
            <div style={{width:72,height:72,borderRadius:36,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:36,border:`2px solid ${T.accent}`}}>{user.avatar}</div>
            <div style={{position:"absolute",bottom:-2,right:-2,width:24,height:24,borderRadius:12,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:`2px solid ${T.bg}`}}>✏️</div>
          </div>
          {showAvatarPicker&&<div style={{...S.card,marginTop:10,padding:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
            {AVATARS.map(a=><button key={a} onClick={()=>{setUser(p=>({...p,avatar:a}));api.updateMe({avatar_url:a}).catch(()=>{});setShowAvatarPicker(false)}} style={{fontSize:24,background:user.avatar===a?T.accentGlow:"transparent",border:user.avatar===a?`2px solid ${T.accent}`:"2px solid transparent",borderRadius:10,padding:4,cursor:"pointer",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center"}}>{a}</button>)}
          </div>}
          <div style={{color:T.text,fontWeight:700,fontSize:20,marginTop:10}}>{displayName()}</div>
          <div style={{color:T.textSec,fontSize:13}}>@{displayUsername()}</div>
        </div>
        <div style={{display:"flex",background:T.raised,borderRadius:10,overflow:"hidden",marginBottom:20}}>{["insights","posts"].map(t=><button key={t} onClick={()=>setPTab(t)} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:pTab===t?T.accent:"transparent",color:pTab===t?"#fff":T.textSec,borderRadius:pTab===t?10:0}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
        {pTab==="insights"&&(<>
          <p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Your Insights</p>
          <div style={{display:"flex",gap:8,marginBottom:22}}><StatCard value={daysActive} label="Days Active"/><StatCard value={myPostCount} label="Posts Created"/><StatCard value={joined.length} label="Circles Joined"/></div>

          {/* Today's mood summary — moved from home */}
          {avgTodayMood&&<div style={{...S.card,padding:"14px 16px",marginBottom:14,textAlign:"center"}}>
            <div style={{color:T.textSec,fontSize:11,fontWeight:600,marginBottom:6}}>TODAY'S OVERALL MOOD</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{fontSize:28}}>{MOODS.find(m=>m.value===avgTodayMood)?.emoji}</span>
              <span style={{color:T.text,fontSize:14,fontWeight:600}}>{MOODS.find(m=>m.value===avgTodayMood)?.label}</span>
            </div>
            <div style={{color:T.textDim,fontSize:10,marginTop:4}}>Average across mood log, journal, and posts</div>
          </div>}

          {/* Streak + week — moved from home */}
          <div style={{...S.card,marginBottom:14,display:"flex",alignItems:"center",gap:14,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:80}}><div style={{fontSize:34,fontWeight:900,color:T.accent,fontFamily:"'Outfit',sans-serif",lineHeight:1}}>{streak}</div><div><div style={{fontSize:11,fontWeight:600,color:T.textSec}}>Day Streak</div><div style={{fontSize:10,color:T.accent,fontWeight:500}}>Keep it up!</div></div></div>
            <div style={{flex:1,display:"flex",justifyContent:"space-around"}}>{(()=>{const now=new Date();return Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-now.getDay()+i);return{n:dayNames[i],d:d.getDate(),today:d.toDateString()===now.toDateString()}})})().map((d,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:10,color:T.textSec,fontWeight:600,marginBottom:4}}>{d.n}</div><div style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:d.today?T.accent:"transparent",color:d.today?"#fff":T.textDim}}>{d.d}</div></div>)}</div>
          </div>

          <p style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:10}}>Your Moods This Month</p>
          <div style={{...S.card,padding:16}}><p style={{color:T.textSec,fontSize:13,margin:"0 0 12px",textAlign:"center",fontWeight:600}}>{mo}</p><div style={{display:"flex",justifyContent:"space-around"}}>{MOODS.map(m=><div key={m.value} style={{textAlign:"center"}}><span style={{fontSize:26}}>{m.emoji}</span><div style={{color:T.textSec,fontSize:13,marginTop:4,fontWeight:600}}>{moodCounts[m.value]||0}</div></div>)}</div></div>
          <button style={{...S.btnOutline,marginTop:14}} onClick={()=>nav("moodGraph")}>View Mood Graph</button>
          <button style={{...S.btnOutline,marginTop:8}} onClick={()=>nav("reminders")}>Manage Reminders</button>

          {/* Top contributors — moved from home */}
          {allUsers.length>0&&<div style={{marginTop:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{color:T.text,fontWeight:600,fontSize:15,margin:0,display:"flex",alignItems:"center",gap:6}}><Ic.Trophy/> Top Contributors</p>
              <span style={{color:T.accent,fontSize:13,cursor:"pointer",fontWeight:500}} onClick={()=>nav("topContributors")}>View all</span>
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
              {getSortedContributors().slice(0,4).map((u,i)=>(
                <div key={u.id} onClick={()=>{setViewingProfile(u);nav("userProfile")}} style={{...S.card,minWidth:100,padding:"12px 10px",textAlign:"center",cursor:"pointer",position:"relative",flex:"0 0 auto"}}>
                  {i<3&&<div style={{position:"absolute",top:6,right:8,fontSize:12}}>{["🥇","🥈","🥉"][i]}</div>}
                  <div style={{fontSize:28,marginBottom:4}}>{u.avatar}</div>
                  <div style={{color:T.text,fontWeight:600,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.name}</div>
                  <div style={{color:T.accent,fontWeight:800,fontSize:13,marginTop:2,fontFamily:"'Outfit',sans-serif"}}>#{i+1}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* Your circles — moved from home */}
          {circles.filter(c=>joined.includes(c.id)).length>0&&<div style={{marginTop:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><p style={{color:T.text,fontWeight:600,fontSize:15,margin:0}}>Your Circles</p><span style={{color:T.accent,fontSize:13,cursor:"pointer"}} onClick={()=>tabNav("explore")}>View all</span></div>
            {circles.filter(c=>joined.includes(c.id)).slice(0,3).map(c=><div key={c.id} onClick={()=>{setSelCircle(c);nav("circleDetail")}} style={{...S.card,marginBottom:8,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer"}}><div style={{width:40,height:40,borderRadius:20,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Users/></div><div><div style={{color:T.text,fontWeight:600,fontSize:14}}>{c.tag}</div><div style={{color:T.textSec,fontSize:11}}>{c.members} Members</div></div></div>)}
          </div>}
        </>)}
        {pTab==="posts"&&(myPostCount===0?<div style={{textAlign:"center",color:T.textDim,marginTop:40}}><p style={{fontSize:36}}>📝</p><p>No posts yet</p></div>:posts.filter(p=>isMyPost(p)).map(p=><PostCard key={p.id} p={p}/>))}
      </>);
    }

    // ── SETTINGS ─────────────────────────────────────────────────
    if(screen==="settings"){
      return(<>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Settings" titleColor={T.accent}/>
        <p style={S.sectionLabel}>ACCOUNT INFORMATION</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{color:T.text,fontSize:14}}>Anonymous?</span><div style={{display:"flex",background:T.raised,borderRadius:20,overflow:"hidden"}}>{["On","Off"].map(v=><button key={v} onClick={()=>setSettingsAnon(v==="On")} style={{padding:"6px 18px",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:(settingsAnon&&v==="On")||(!settingsAnon&&v==="Off")?T.accent:"transparent",color:(settingsAnon&&v==="On")||(!settingsAnon&&v==="Off")?"#fff":T.textSec}}>{v}</button>)}</div></div>
        {settingsAnon&&<p style={{color:T.textDim,fontSize:11,marginBottom:10,marginTop:-8}}>Your display name and username will both show as "Anonymous" to other users.</p>}
        <label style={S.label}>Display Name</label><input style={S.input} value={settingsName} onChange={e=>setSettingsName(e.target.value)}/>
        <label style={S.label}>Username</label><input style={S.input} value={settingsUser} onChange={e=>setSettingsUser(e.target.value)}/>
        <label style={S.label}>Email</label><input style={S.input} value={user.email} readOnly/>
        <label style={S.label}>Phone Number</label><input style={S.input} value={settingsPhone} onChange={e=>setSettingsPhone(e.target.value)}/>
        <button style={{...S.btnFull,marginTop:20}} onClick={saveSettings}>Save</button>
        <button style={{...S.btnOutline,marginTop:10,borderColor:T.danger,color:T.danger}} onClick={handleLogout}>Log Out</button>
      </>);
    }

    if(screen==="notifs")return(<><TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Notifications"/>{notifs.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:60}}><p style={{fontSize:36}}>🔔</p><p>No notifications</p></div>:notifs.map(n=><div key={n.id} onClick={()=>{setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x));api.markNotifRead(n.id).catch(()=>{})}} style={{...S.card,marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,opacity:n.read?0.5:1,cursor:"pointer"}}><div style={{width:8,height:8,borderRadius:4,background:n.read?"transparent":T.accent,flexShrink:0}}/><div style={{flex:1}}><div style={{color:T.text,fontSize:13}}>{n.text}</div><div style={{color:T.textSec,fontSize:11,marginTop:2}}>{timeAgo(new Date(n.ts||Date.now()))}</div></div></div>)}</>);

    if(screen==="groupChat"){
      return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title={(selCircle?.name||"Group")+" Chat"}/>
        <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>{groupMsgs.map((m,i)=>{const u=allUsers.find(x=>x.id===m.from);const name=m.senderName||u?.name||"Member";return(<div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",marginBottom:8}}><div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:16,background:m.from==="me"?T.accent:T.card,borderBottomRightRadius:m.from==="me"?4:16,borderBottomLeftRadius:m.from==="me"?16:4}}>{m.from!=="me"&&<p style={{fontSize:10,color:T.accent,margin:"0 0 4px",fontWeight:600}}>{name}</p>}<p style={{color:m.from==="me"?"#fff":T.text,fontSize:13,margin:0,lineHeight:1.45}}>{m.text}</p><p style={{fontSize:10,color:m.from==="me"?"rgba(255,255,255,.55)":T.textDim,margin:"3px 0 0",textAlign:"right"}}>{m.time}</p></div></div>)})}<div ref={groupEndRef}/></div>
        <div style={{display:"flex",gap:8,paddingTop:8,flexShrink:0}}><input style={{...S.input,flex:1,marginBottom:0}} placeholder="Message the group..." value={groupInput} onChange={e=>setGroupInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendGroupMsg()}/><button style={{...S.icoBtn,background:T.card,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={sendGroupMsg}><Ic.Send/></button></div>
      </div>);
    }

    if(screen==="moodGraph"){
      // Combine mood values from all 3 sources, grouped by day
      const byDay={};
      const addToDay=(dateStr,val)=>{if(!byDay[dateStr])byDay[dateStr]={vals:[],date:new Date(dateStr)};byDay[dateStr].vals.push(val)};
      moodLog.forEach(m=>{const d=m.date instanceof Date?m.date:new Date(m.date);if(isNaN(d))return;addToDay(d.toDateString(),m.value)});
      journals.forEach(j=>{const d=j.date instanceof Date?j.date:new Date(j.date);if(isNaN(d)||!j.mood)return;addToDay(d.toDateString(),j.mood)});
      posts.forEach(p=>{const mine=p.userId==="me"||p.userId===user.id||p.username===user.username;if(!mine||!p.mood)return;const d=new Date(p.ts||Date.now());if(isNaN(d))return;addToDay(d.toDateString(),p.mood)});
      // Build sorted array of daily averages (rounded up), take last 14 days
      const data=Object.values(byDay).map(d=>({date:d.date,value:Math.ceil(d.vals.reduce((a,b)=>a+b,0)/d.vals.length),count:d.vals.length})).sort((a,b)=>a.date-b.date).slice(-14);
      if(data.length===0)return(<><TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Mood Trends"/><div style={{textAlign:"center",color:T.textDim,marginTop:60}}><p style={{fontSize:36}}>📊</p><p>Log some moods to see your trends</p></div></>);
      const totalEntries=data.reduce((a,b)=>a+b.count,0);
      const overallAvg=data.reduce((a,b)=>a+b.value*b.count,0)/totalEntries;
      return(<><TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Mood Trends"/>
        <div style={{...S.card,padding:20}}>
          <p style={{color:T.textSec,fontSize:11,textAlign:"center",fontWeight:600,margin:"0 0 14px"}}>DAILY AVERAGE (Mood Log + Journal + Posts)</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:170,justifyContent:"center"}}>{data.map((d,i)=>{const m=MOODS.find(x=>x.value===d.value);return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1,maxWidth:36}}><span style={{fontSize:15}}>{m?.emoji}</span><div style={{width:"100%",maxWidth:28,borderRadius:6,height:(d.value/5)*120,background:`linear-gradient(to top, ${m?.color}66, ${m?.color})`}}/><span style={{fontSize:9,color:T.textDim}}>{d.date.getDate()}/{d.date.getMonth()+1}</span></div>)})}</div>
        </div>
        <div style={{...S.card,marginTop:14,padding:16}}><p style={{color:T.text,fontWeight:600,fontSize:14,margin:"0 0 6px"}}>Summary</p><p style={{color:T.textSec,fontSize:13,margin:0,lineHeight:1.5}}>{totalEntries} mood data points across {data.length} day{data.length!==1?"s":""}. Overall average: {overallAvg.toFixed(1)}/5.{streak>1&&` ${streak}-day streak!`}</p></div>
      </>);
    }

    if(screen==="reminders"){
      const formatTime12=t24=>{if(!t24)return "";const[h,m]=t24.split(":");const hr=parseInt(h);const ampm=hr>=12?"PM":"AM";const hr12=hr%12||12;return`${hr12}:${m} ${ampm}`};
      const saveReminder=()=>{if(!reminderText.trim())return;const formatted=formatTime12(reminderTime);if(editReminderId){setReminders(p=>p.map(x=>x.id===editReminderId?{...x,text:reminderText,time:formatted}:x))}else{setReminders(p=>[...p,{id:Date.now(),text:reminderText,time:formatted,on:true}])}setReminderText("");setReminderTime("09:00");setEditReminderId(null);setShowAddReminder(false)};
      const deleteReminder=id=>{if(confirm("Delete this reminder?"))setReminders(p=>p.filter(x=>x.id!==id))};
      const editReminder=r=>{setEditReminderId(r.id);setReminderText(r.text);const m=r.time.match(/(\d+):(\d+)\s*(AM|PM)/i);if(m){let h=parseInt(m[1]);if(m[3].toUpperCase()==="PM"&&h<12)h+=12;if(m[3].toUpperCase()==="AM"&&h===12)h=0;setReminderTime(`${String(h).padStart(2,"0")}:${m[2]}`)}setShowAddReminder(true)};
      return(<>
        <TopBar left={<button style={S.icoBtn} onClick={goBack}><Ic.Back/></button>} title="Reminders" right={!showAddReminder&&<button style={S.btnSmall} onClick={()=>{setShowAddReminder(true);setEditReminderId(null);setReminderText("");setReminderTime("09:00")}}>+ Add</button>}/>
        {showAddReminder&&<div style={{...S.card,marginBottom:14,padding:16}}>
          <p style={{color:T.text,fontWeight:600,fontSize:14,margin:"0 0 10px"}}>{editReminderId?"Edit Reminder":"New Reminder"}</p>
          <input style={S.input} placeholder="Reminder text (e.g. Drink water)" value={reminderText} onChange={e=>setReminderText(e.target.value)}/>
          <label style={S.label}>Time</label>
          <input style={S.input} type="time" value={reminderTime} onChange={e=>setReminderTime(e.target.value)}/>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button style={{...S.btnSmall,flex:1,padding:"10px 0"}} onClick={saveReminder}>{editReminderId?"Update":"Add"}</button>
            <button style={{...S.btnSmall,flex:1,padding:"10px 0",background:T.raised,color:T.textSec}} onClick={()=>{setShowAddReminder(false);setEditReminderId(null);setReminderText("")}}>Cancel</button>
          </div>
        </div>}
        {reminders.length===0?<div style={{textAlign:"center",color:T.textDim,marginTop:40}}><p style={{fontSize:36}}>⏰</p><p>No reminders yet</p></div>
        :reminders.map(r=><div key={r.id} style={{...S.card,marginBottom:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:T.text,fontSize:14,fontWeight:500}}>{r.text}</div>
            <div style={{color:T.textSec,fontSize:12}}>{r.time}</div>
          </div>
          <button style={{...S.icoBtn,fontSize:14,padding:4}} onClick={()=>editReminder(r)}>✏️</button>
          <button style={{...S.icoBtn,padding:4}} onClick={()=>deleteReminder(r.id)}><Ic.X/></button>
          <button onClick={()=>setReminders(p=>p.map(x=>x.id===r.id?{...x,on:!x.on}:x))} style={{width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",background:r.on?T.accent:T.border,position:"relative",transition:"background .2s",flexShrink:0}}>
            <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:2,left:r.on?22:2,transition:"left .2s"}}/>
          </button>
        </div>)}
      </>);
    }

    return null;
  };

  const showTabs=["home","explore","journal","search","profile"].includes(screen);

  return(
    <div style={S.shell}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.phone}>
        {fcmToast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:100,background:T.card,border:`1px solid ${T.accent}44`,borderRadius:14,padding:"12px 16px",maxWidth:360,width:"90%",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",cursor:"pointer"}} onClick={()=>setFcmToast(null)}><div style={{color:T.accent,fontWeight:600,fontSize:13}}>🔔 {fcmToast.title}</div><div style={{color:T.text,fontSize:12,marginTop:4}}>{fcmToast.body}</div></div>}
        <div style={S.content}>{renderScreen()}</div>
        {showTabs&&<div style={S.tabBar}>{[{k:"home",I:Ic.Home,l:"Home"},{k:"explore",I:Ic.Compass,l:"Explore"},{k:"journal",I:Ic.Book,l:"Journal"},{k:"search",I:Ic.Search,l:"Search"},{k:"profile",I:Ic.Heart,l:"Profile"}].map(t=><button key={t.k} style={S.tabBtn} onClick={()=>tabNav(t.k)}><t.I a={tab===t.k}/><span style={{fontSize:9,color:tab===t.k?T.accent:T.textSec,marginTop:3,fontWeight:tab===t.k?600:400}}>{t.l}</span></button>)}</div>}
      </div>
    </div>
  );
}

const S={
  shell:{minHeight:"100vh",background:"#000",display:"flex",justifyContent:"center",fontFamily:"'Outfit',-apple-system,BlinkMacSystemFont,sans-serif"},
  phone:{width:"100%",maxWidth:420,minHeight:"100vh",background:T.bg,position:"relative",display:"flex",flexDirection:"column"},
  content:{flex:1,overflowY:"auto",paddingTop:"calc(16px + env(safe-area-inset-top, 0px))",paddingLeft:18,paddingRight:18,paddingBottom:88,WebkitOverflowScrolling:"touch"},
  card:{background:T.card,borderRadius:14,padding:16,border:`1px solid ${T.border}`},
  input:{width:"100%",padding:"12px 14px",background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"},
  textarea:{width:"100%",padding:"12px 14px",background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5},
  label:{color:T.textSec,fontSize:12,display:"block",marginBottom:4,fontWeight:500},
  sectionLabel:{color:T.textSec,fontSize:11,fontWeight:700,letterSpacing:0.5,marginBottom:8,marginTop:16},
  btnFull:{width:"100%",padding:"13px 0",background:T.accent,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  btnOutline:{width:"100%",padding:"12px 0",background:"transparent",border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"},
  btnSmall:{padding:"7px 16px",background:T.accent,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  icoBtn:{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",fontFamily:"inherit"},
  dot:{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:4,background:T.danger},
  avatarSm:{width:34,height:34,borderRadius:17,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0},
  avatarMd:{width:42,height:42,borderRadius:21,background:T.accentGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
  fab:{position:"fixed",bottom:"calc(80px + env(safe-area-inset-bottom, 0px))",right:"calc(50% - 185px)",width:52,height:52,borderRadius:26,background:T.accent,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 24px rgba(63,184,160,0.35)",zIndex:10},
  tabBar:{display:"flex",justifyContent:"space-around",padding:"6px 0 14px",paddingBottom:"calc(14px + env(safe-area-inset-bottom, 0px))",background:T.surface,borderTop:`1px solid ${T.border}`,position:"sticky",bottom:0,flexShrink:0},
  tabBtn:{display:"flex",flexDirection:"column",alignItems:"center",background:"none",border:"none",cursor:"pointer",padding:"4px 12px",gap:1,fontFamily:"inherit"},
};
