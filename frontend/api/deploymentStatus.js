import { createClient } from "@supabase/supabase-js";

const supabase =
createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeStatus(
state
) {
if (!state)
return "BUILDING";

const s =
state.toUpperCase();

if (
s === "READY"
) {
return "READY";
}

if (
[
"ERROR",
"FAILED",
"CANCELED"
].includes(s)
) {
return "ERROR";
}

return "BUILDING";
}

function buildTroubleshooting(
raw
) {
const text =
String(
raw || ""
).toLowerCase();

const fixes = [];

if (
text.includes(
"package"
)
) {
fixes.push(
"• Verify package.json"
);
}

if (
text.includes(
"module"
)
) {
fixes.push(
"• Install dependencies"
);
}

if (
text.includes(
"build"
)
) {
fixes.push(
"• Verify build script"
);
}

if (
text.includes(
"environment"
)
) {
fixes.push(
"• Configure environment variables"
);
}

if (
text.includes(
"workspace"
)
) {
fixes.push(
"• Monorepo detected"
);
}

if (
fixes.length === 0
) {
fixes.push(
"• Review deployment logs"
);

fixes.push(
"• Run locally"
);

fixes.push(
"• Verify repo structure"
);
}

return fixes.join(
"\n"
);
}

async function fetchLogs(
id,
headers
) {
try {

const res =
await fetch(
`https://api.vercel.com/v6/deployments/${id}/events`,
{
headers,
}
);

if (
!res.ok
) {
return "";
}

const data =
await res.json();

return (
data.events ||
[]
)
.map(
(
e
)=>
e.payload
?.text
)
.filter(
Boolean
)
.join(
"\n"
);

} catch {

return "";

}
}

export default async function handler(
req,
res
) {

try {

const {
id
} =
req.query;

if (
!id
) {
return res
.status(
400
)
.json({
error:
"missing id",
});
}

/*
FIND LOCAL DB ROW
*/

const {
data:
row,
error:
dbError,
}
=
await supabase
.from(
"deployments"
)
.select(
"*"
)
.eq(
"deployment_id",
id
)
.single();

if (
dbError ||
!row
) {

return res
.status(
404
)
.json({
error:
"deployment not found",
});

}

const vercelId =
  row.vercel_deployment_id;

if (!vercelId) {

return res
.status(200)
.json({
status: row.status,
logs:
row.logs ||
"Waiting for deployment...",
url: row.url,
});

}

const headers =
{
Authorization:
`Bearer ${process.env.VERCEL_TOKEN}`,
};

const dep =
await fetch(
`https://api.vercel.com/v13/deployments/${vercelId}`,
{
headers,
cache: "no-store",
}
);

const deployment =
await dep.json();

if (
!dep.ok
) {

return res
.status(
500
)
.json({
error:
deployment
?.error
?.message ||
"vercel failed",
});

}

const status =
normalizeStatus(
deployment.readyState
);

const url =
deployment.url
? `https://${deployment.url}`
: row.url;

const rawLogs =
await fetchLogs(
vercelId,
headers
);

let logs =
rawLogs;

if (
status ===
"READY"
) {

logs =
`
✅ Deployment completed

Status:
READY

URL:
${url}

Deployment ID:
${vercelId}
`
.trim();

}

if (
status ===
"ERROR"
) {

logs =
`
❌ Deployment failed

Reason:

${
rawLogs ||
deployment
?.error
?.message ||
"Build failed"
}

Troubleshooting:

${buildTroubleshooting(
rawLogs
)}
`
.trim();

}

await supabase
.from(
"deployments"
)
.update({

status,

url,

logs,

})
.eq(
"id",
row.id
);

return res
.status(
200
)
.json({

status,

url,

logs,

});

}

catch (
err
) {

console.error(
"[STATUS ERROR]",
err
);

return res
.status(
500
)
.json({

error:
err.message,

});

}
}