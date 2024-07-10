const sql=require('mysql2/promise')
const pool=sql.createPool({
    connectionLimit:100,
    host:'localhost',
    port:3306,
    user:'root',
    password:'Shri1234*',
    database:'covid_tracing'
})

async function querydatabase(query,params){
    let connection=await pool.getConnection().catch((err)=>{})
    if(!connection)return {status:'err'}
    let [res,logs]=await connection.query(query,params)
    return {status:'ok',data:res}
}
