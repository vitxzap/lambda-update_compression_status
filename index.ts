
import { Context, S3Event, S3Handler } from 'aws-lambda';
import { readFileSync } from 'node:fs';
import { Pool } from "pg"

const cert = readFileSync("./certs/global-bundle.pem");
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 1,
    ssl: {
        rejectUnauthorized: false,
        ca: cert
    },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});


export const handler: S3Handler = async (event: S3Event, context: Context) => {
    const client = await pool.connect();
    const { object } = event.Records[0].s3
    const [rootFolder, userId, compressionId, filename] = object.key.split("/")
    try {
        const query = await client.query(`UPDATE ${process.env.COMPRESSION_TABLE} 
            SET 
            "originalName" = $1, 
            "originalSize" = $2, 
            status = $3, 
            "s3Key" = $4
            WHERE id = $5
            RETURNING status
            `, [filename, object.size, "CREATED", object.key, compressionId])

    }
    catch (err) {
        console.error("Unexpected error: ", err)
        throw err
    }
    finally {
        client.release()
    }

};