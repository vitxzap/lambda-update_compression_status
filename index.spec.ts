import { Context, S3Event } from "aws-lambda"
jest.mock("node:fs", () => ({
    readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-cert"))
}))
const mockQuery = jest.fn()
const mockRelease = jest.fn()
const mockConnect = jest.fn().mockResolvedValue({
    query: mockQuery,
    release: mockRelease
})
jest.mock("pg", () => ({
    Pool: jest.fn().mockImplementation(() => ({
        connect: mockConnect
    }))
}))
import { handler } from "./index"
const createS3Event = (key: string, size: number): S3Event => ({
    Records: [{
        s3: {
            bucket: { name: "bucket", ownerIdentity: { principalId: "" }, arn: "" },
            object: { key, size, eTag: "", versionId: "", }
        },
    } as any,
    ]
});



describe("Lambda Function", () => {
    const key = "uploads/user123/compression456/filename.zip"
    const size = 1024
    const queryData = ["filename.zip", size, "CREATED", key, "compression456"]
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.DB_HOST = "host"
        process.env.COMPRESSION_TABLE = "table"
        process.env.DB_PASSWORD = "password"
        process.env.DB_USER = "user"
        process.env.NAME = "name"

    })
    it("Should execute the update correctly", async () => {
        //Mocking the query result
        mockQuery.mockResolvedValueOnce({ rows: [{ status: "CREATED" }] })

        //Testing the function
        await handler(createS3Event(key, size), {} as Context, jest.fn())

        //The function needs to at least try to connect
        expect(mockConnect).toHaveBeenCalledTimes(1)

        //The function needs to call query method with these parameters
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining(`UPDATE ${process.env.COMPRESSION_TABLE}`), queryData)
        expect(mockRelease).toHaveBeenCalledTimes(1)
    })

    it("Should call release even if the query fails", async () => {
        //Mocking the query error
        mockQuery.mockRejectedValueOnce(new Error("DB Error"))

        //Expect the handler to reject and to throws a "DB Error"  
        await expect(handler(createS3Event(key, size), {} as Context, jest.fn())).rejects.toThrow("DB Error")

        expect(mockRelease).toHaveBeenCalledTimes(1)
    })
})