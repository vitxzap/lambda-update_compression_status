# Update Compression Status (Lambda Function) 💽
This function will receive a S3Event to update the compression status from PENDING to CREATED and fill some fields like the original size.

# Performance 🚀
From last 3 most recent logs (07-03-2026 06:00 UTC-3) **512MB RAM** 
| Cold Start    | Duration     | Billed   |
|-------------|-------------|-------------|
| 338.67 ms   | 239.26 ms     | 578 ms    | 
| 0 ms        | 135.90 ms     | 136 ms    |
| 0 ms        | 118.17 ms     | 119 ms    |
