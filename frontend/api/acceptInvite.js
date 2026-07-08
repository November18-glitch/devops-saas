import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req,res){

if(req.method!=="POST"){
return res.status(405).json({
error:"Method not allowed"
});
}

try{

const authToken=
req.headers.authorization?.replace(
"Bearer ",
""
);

const {
data:{user}
}=await supabase.auth.getUser(authToken);

if(!user){
return res.status(401).json({
error:"Unauthorized"
});
}

const {token}=req.body;

const {
data:invite
}=await supabase
.from("team_invites")
.select("*")
.eq("token",token)
.single();

if(!invite){
return res.status(404).json({
error:"Invite not found"
});
}

if(invite.accepted){
return res.status(400).json({
error:"Invite already accepted"
});
}

await supabase
.from("team_members")
.insert({

team_id:invite.team_id,

user_id:user.id,

email:user.email,

role:invite.role,

status:"active"

});
await supabase
.from("team_invites")
.update({

accepted:true,

status:"accepted"

})
.eq("id",invite.id);

return res.status(200).json({
success:true
});

}

catch(err){

return res.status(500).json({
error:err.message
});

}

}