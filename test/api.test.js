const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  let authToken = '';
  let adminToken = '';
  let petId = '';
  let adminId = '';
  let adoptionId = '';

  // User Routes
  describe('User API Tests', () => {
    it('Post /register | Register new adopter', async () => {
      const response = await request(app).post('/api/user/register').send({
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmail.com',
        password: '12345678',
        birthDate: '2021-09-09',
        address: 'test',
        gender: 'Male',
        phone: '9843041037',
        role: 'adopter',
      });
      if (response.statusCode === 201) {
        expect(response.body.message).toEqual('User Registered Successfully!');
      } else {
        expect(response.body.message).toEqual('User already exists');
      }
    });

    it('Post /register | Register new owner', async () => {
      const response = await request(app).post('/api/user/register').send({
        firstName: 'test',
        lastName: 'test',
        email: 'admin@gmail.com',
        password: '12345678',
        birthDate: '2021-09-09',
        address: 'test',
        gender: 'Male',
        phone: '1234567899',
        role: 'owner',
      });

      if (response.statusCode === 201) {
        expect(response.body.message).toEqual('User Registered Successfully!');
      } else {
        expect(response.body.message).toEqual('User already exists');
      }
      adminId = response.body.data._id;
    });

    it('Post /login | Login user (adopter)', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: 'test@gmail.com',
        password: '12345678',
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });
    it('Post /login | Login user (adopter) wrong password', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: 'test@gmail.com',
        password: '123456789',
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('Post /login | Login user (owner)', async () => {
      const response = await request(app).post('/api/user/login').send({
        email: 'admin@gmail.com',
        password: '12345678',
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      adminToken = response.body.token;
    });

    it('Get /get | Get user by id', async () => {
      const response = await request(app)
        .get(`/api/user/getMe`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe('test@gmail.com');
    });
  });

  // Pet Routes
  describe('Pet API Tests', () => {
    it('Post /add | Add new pet without one field', async () => {
      const response = await request(app)
        .post('/api/pet/add')
        .send({
          petSpecies: 'test',
          petBreed: 'test',
          petAge: 2,
          petColor: 'test',
          petWeight: 10,
          petDescription: 'test',
        })
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message');
      petId = response.body.data._id;
    });
    it('Post /add | Add new pet', async () => {
      const response = await request(app)
        .post('/api/pet/add')
        .send({
          petName: 'test',
          petSpecies: 'test',
          petBreed: 'test',
          petAge: 2,
          petColor: 'test',
          petWeight: 10,
          petDescription: 'test',
        })
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message');
      petId = response.body.data._id;
    });

    it('Get /get/:petId | Get pet by id', async () => {
      const response = await request(app)
        .get(`/api/pet/get/${petId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.petName).toBe('test');
    });

    it('Get /all | Get All pets', async () => {
      const response = await request(app)
        .get(`/api/pet/pagination`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 5 });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('pets');
      const pets = response.body.pets;
      expect(pets.length <= 5 && pets.length > 0).toBe(true);
    });
  });

  // Favorite Routes
  describe('Favorite API Tests', () => {
    it('Post /add | Add favorite pet', async () => {
      const response = await request(app)
        .post(`/api/favorite/add`)
        .send({
          petId: petId,
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message');
    });

    it('Get /get | Get favorite pets', async () => {
      const response = await request(app)
        .get(`/api/favorite/get`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('favorites');
      const favorites = response.body.favorites;
      expect(favorites.length > 0).toBe(true);
    });

    it('Delete /delete | Delete favorite pet', async () => {
      const response = await request(app)
        .delete(`/api/favorite/delete/${petId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  // Adoption Routes
  describe('Adoption API Tests', () => {
    it('Post /add | Adopt pet (successful)', async () => {
      const form = {
        fname: 'test',
        lname: 'test',
        email: 'test@gmail.com',
        age: 21,
        phone: '1234567890',
        gender: 'male',
        houseType: 'test',
        reason: 'test',
        yard: 'test',
        petExperience: 'test',
      };
      const response = await request(app)
        .post(`/api/adoption/create`)
        .send({
          pet: petId,
          form: form,
          formReceiver: adminId,
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message');
      adoptionId = response.body.data._id;
    });

    it('Post /add | Adopt pet (duplicate - should fail)', async () => {
      const form = {
        fname: 'test',
        lname: 'test',
        email: 'test@gmail.com',
        age: 21,
        phone: '1234567890',
        gender: 'male',
        houseType: 'test',
        reason: 'test',
        yard: 'test',
        petExperience: 'test',
      };
      const response = await request(app)
        .post(`/api/adoption/create`)
        .send({
          pet: petId,
          form: form,
          formReceiver: adminId,
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('Get /get/:petId | Get adoption by pet id', async () => {
      const response = await request(app)
        .get(`/api/adoption/get/${petId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('adoption');
      expect(response.body.count > 0).toBe(true);
    });

    it('Put /update/:adoptionId | Update adoption status', async () => {
      const response = await request(app)
        .put(`/api/adoption/status/${adoptionId}`)
        .send({
          status: 'approved',
        })
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  // Cleanup
  describe('Cleanup', () => {
    it('Delete /delete | Delete pet', async () => {
      const response = await request(app)
        .delete(`/api/pet/delete/${petId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('Delete /delete | Delete user without token', async () => {
      const response = await request(app).delete(`/api/user/delete`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
    it('Delete /delete | Delete adopter', async () => {
      const response = await request(app)
        .delete(`/api/user/delete`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
    it('Delete /delete | Delete owner', async () => {
      const response = await request(app)
        .delete(`/api/user/delete`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});
