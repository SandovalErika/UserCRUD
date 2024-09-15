import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../../Service/users.service';
import { CacheManagerService } from '../../Service/cacheManager.service';

import { User } from '../../Model/user.model';
import { Profile } from '../../Model/profileUser.model';

import { CreateUserRequest } from '../../Model/dto/Request/user/createUserRequest';
import { UpdateUserRequest } from '../../Model/dto/Request/user/updateUserRequest';
import { SucessfulResponse } from '../../Model/dto/Response/sucessfulResponse';
import { GetUserResponse } from '../../Model/dto/Response/user/getUserResponse';

import HttpCustomException from '../../Exception/HttpCustomException';
import { StatusCodeEnums } from '../../Enum/StatusCodeEnum';

const mockProfiles: Profile[] = [
  { id: 1, code: 'ADMIN', name: 'Administrator' },
  { id: 2, code: 'USER', name: 'Regular User' },
];

const mockExistingUser: User = {
  id: '94adcc2d-9447-4285-8812-edaa9ef8bc98',
  name: 'Erika Sandoval',
  email: 'erikabsandoval@gmail.com',
  age: 30,
  profile: { id: 1, code: 'ADMIN', name: 'Administrator' },
};

const mockNewUser: CreateUserRequest = {
  name: 'Erika Sandoval',
  email: 'erikabsandoval@gmail.com',
  age: 32,
  profile: 'ADMIN',
};

const mockUpdateUser: UpdateUserRequest = {
  id: '94adcc2d-9447-4285-8812-edaa9ef8bc98',
  name: 'Erika Belen Sandoval',
  email: 'erikabsandoval@gmail.com',
  age: 30,
  profile: 'ADMIN',
};

describe('UsersService', () => {
  let service: UsersService;
  let cacheService: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CacheManagerService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            loadDefaultProfiles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    cacheService = module.get<CacheManagerService>(CacheManagerService);
  });

  describe('createUser', () => {
    it('should create a user and return success response', async () => {
      const newUser: CreateUserRequest = mockNewUser;
      const profiles: Profile[] = mockProfiles;

      const result = new SucessfulResponse('User created successfully');

      jest.spyOn(cacheService, 'get').mockResolvedValue(profiles);
      jest.spyOn(cacheService, 'set').mockResolvedValue();
      jest.spyOn(service, '_profileValidation').mockReturnValue({
        id: 1,
        code: 'ADMIN',
        name: 'Admin',
      });
      jest
        .spyOn(service, '_uniqueEmailValidation')
        .mockImplementation(() => {});

      const response = await service.createUser(newUser);
      expect(response).toEqual(result);
      expect(cacheService.get).toHaveBeenCalledWith('defaultProfiles');
      expect(cacheService.set).toHaveBeenCalledWith(
        'allUsers',
        expect.any(Array),
        360000,
      );
    });

    it('should throw an error if profiles cannot be loaded', async () => {
      const newUser: CreateUserRequest = mockNewUser;

      jest.spyOn(cacheService, 'get').mockResolvedValue([]);
      jest.spyOn(cacheService, 'loadDefaultProfiles').mockResolvedValue();
      jest.spyOn(cacheService, 'get').mockResolvedValue([]);

      await expect(service.createUser(newUser)).rejects.toThrow(
        'Profiles could not be loaded into the cache.',
      );
    });

    it('should throw an error if email is not unique', async () => {
      const newUser: CreateUserRequest = mockNewUser;
      const profiles: Profile[] = mockProfiles;

      jest.spyOn(cacheService, 'get').mockResolvedValue(profiles);
      jest.spyOn(cacheService, 'set').mockResolvedValue();
      jest.spyOn(service, '_uniqueEmailValidation').mockImplementation(() => {
        throw new HttpCustomException(
          'Email already registered',
          StatusCodeEnums.EMAIL_DUPLICATED,
        );
      });

      await expect(service.createUser(newUser)).rejects.toThrow(
        HttpCustomException,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return a list of users', async () => {
      const users: User[] = [mockExistingUser];
      const expectedResponse = users.map((user) => new GetUserResponse(user));

      jest.spyOn(cacheService, 'get').mockResolvedValue(users);

      const response = await service.findAllUsers();
      expect(response).toEqual(expectedResponse);
      expect(cacheService.get).toHaveBeenCalledWith('allUsers');
    });

    it('should return an empty list if no users are found', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue([]);

      const response = await service.findAllUsers();
      expect(response).toEqual([]);
    });
  });

  describe('findUserById', () => {
    it('should return a user by ID', async () => {
      const userId = '94adcc2d-9447-4285-8812-edaa9ef8bc98';
      const user: User = mockExistingUser;
      const expectedResponse = new GetUserResponse(user);

      jest.spyOn(cacheService, 'get').mockResolvedValue([user]);

      const response = await service.findUserById(userId);
      expect(response).toEqual(expectedResponse);
      expect(cacheService.get).toHaveBeenCalledWith('allUsers');
    });

    it('should throw an error if user is not found', async () => {
      const userId = '123';
      jest.spyOn(cacheService, 'get').mockResolvedValue([]);

      await expect(service.findUserById(userId)).rejects.toThrow(
        HttpCustomException,
      );
    });
  });

  describe('updateUserById', () => {
    it('should update a user and return success response', async () => {
      const updateUser: UpdateUserRequest = mockUpdateUser;
      const existingUser: User = mockExistingUser;
      const updatedUser: User = mockExistingUser;

      const result = new SucessfulResponse('User updated successfully');

      const profiles = mockProfiles;

      jest.spyOn(cacheService, 'get').mockImplementation((key) => {
        if (key === 'allUsers') {
          return Promise.resolve([existingUser]);
        } else if (key === 'profiles') {
          return Promise.resolve(profiles);
        } else {
          return Promise.resolve([]);
        }
      });

      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const cacheProfiles = await cacheService.get('profiles');

      const response = await service.updateUserById(updateUser);
      expect(response).toEqual(result);
      expect(cacheService.get).toHaveBeenCalledWith('allUsers');
      expect(cacheService.get).toHaveBeenCalledWith('profiles');
      expect(cacheService.set).toHaveBeenCalledWith(
        'allUsers',
        expect.any(Array),
        360000,
      );
    });

    it('should throw an error if user to update is not found', async () => {
      const updateUser: UpdateUserRequest = mockUpdateUser;

      jest.spyOn(cacheService, 'get').mockResolvedValue([]);

      await expect(service.updateUserById(updateUser)).rejects.toThrow(
        HttpCustomException,
      );
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user by ID and return success response', async () => {
      const userId = '94adcc2d-9447-4285-8812-edaa9ef8bc98';
      const existingUser: User = mockExistingUser;

      const result = new SucessfulResponse('User deleted successfully');

      jest.spyOn(cacheService, 'get').mockResolvedValue([existingUser]);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const response = await service.deleteUserById(userId);
      expect(response).toEqual(result);
      expect(cacheService.get).toHaveBeenCalledWith('allUsers');
      expect(cacheService.set).toHaveBeenCalledWith(
        'allUsers',
        expect.any(Array),
        360000,
      );
    });

    it('should throw an error if user to delete is not found', async () => {
      const userId = '123';
      jest.spyOn(cacheService, 'get').mockResolvedValue([]);

      await expect(service.deleteUserById(userId)).rejects.toThrow(
        HttpCustomException,
      );
    });
  });
});
