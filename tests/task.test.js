const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/tasks");
const {
  userId,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  TaskThree,
  configDb,
} = require("./fixtures/db");

beforeEach(configDb);

test("Should create a new task ", async () => {
  const response = await request(app)
    .post("/task")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send({
      description: "Test file",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test("should get tasks for a user", async () => {
  const response = await request(app)
    .get("/task")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send()
    .expect(200);

  const task = await response.body.length;
  expect(task).toEqual(2);
});

test("Second user to delete first task", async () => {
  const response = await request(app)
    .delete(`/task/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.token[0].token}`)
    .send()
    .expect(404);

  const task1 = await Task.findById(taskOne._id);
  expect(task1).not.toBeNull();
});

test("should get task by Id", async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send()
    .expect(201);
});

test("should fail to get task for unauth id", async () => {
  await request(app).get(`/tasks/${taskOne._id}`).send().expect(401);
});

test("should update user task", async () => {
  await request(app)
    .patch(`/updatetask/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send({
      description: "This is new",
    })
    .expect(200);
});

test("should not update task for unauth user", async () => {
  await request(app).patch(`/updatetask/${taskOne._id}`).send().expect(401);
});

test("Should delete user task", async () => {
  await request(app)
    .delete(`/task/delete/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send()
    .expect(200);
});

test("unauth user cannot delete task", async () => {
  await request(app).delete(`/task/delete/${taskOne._id}`).send().expect(401);
});
