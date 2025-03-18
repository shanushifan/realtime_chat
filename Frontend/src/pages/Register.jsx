import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from 'react-hot-toast';
import { Baseurl } from '../../services api/baseurl';

export default function Register() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    profile: null,
  });

  // Register API Call
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('password', user.password);
      formData.append('profile', user.profile);
      formData.append('mobile', user.mobile);


      const res = await axios.post(`${Baseurl}/api/Auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      const data = await res.data;

      if (res.status === 200) {
        toast.success(data.message);
        setUser({
          name: '',
          email: '',
          password: '',
          profile: null,
          mobile:''
        });
        navigate('/login');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    }
  };

  // Handle Input Change
  const handleInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile') {
      setUser({ ...user, [name]: files[0] });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <section className="bg-gray-100 dark:bg-gray-900">
    <div className="flex flex-col items-center justify-center px-6 py-7 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-2 md:space-y-0 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Register
          </h1>
          <form className="space-y-2 md:space-y-0" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="profile" className="flex text-white text-base px-5 py-0 outline-none rounded w-max cursor-pointer mx-auto font-[sans-serif]">
                <img
                  src={user.profile ? URL.createObjectURL(user.profile) : 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="rounded-[50%] w-[95px] h-[95px] object-cover"
                />
                <input type="file" id="profile" name="profile" onChange={handleInput} className="hidden" />
              </label>
            </div>
            <div>
              <label htmlFor="name" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">Name</label>
              <input type="text" name="name" value={user.name} onChange={handleInput} placeholder="Enter your name" required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="email" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">Email</label>
              <input type="email" name="email" value={user.email} onChange={handleInput} placeholder="Enter your email" required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" />
            </div>
            {/* 🔹 Mobile Number Input Field Added */}
            <div>
              <label htmlFor="mobile" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">Mobile Number</label>
              <input type="tel" name="mobile" value={user.mobile} onChange={handleInput} placeholder="Enter your mobile number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="password" className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">Password</label>
              <input type="password" name="password" value={user.password} onChange={handleInput} placeholder="••••••••" required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" />
            </div>
            <div>
              <button type="submit" className="mt-4 w-full bg-blue-500 text-white font-medium rounded-lg text-lg px-5 py-2 text-center">
                Register
              </button>
            </div>
            <p className="text-gray-800 text-sm mt-8 text-center">
              Already have an account? 
              <button className="text-blue-600 hover:underline ml-1 font-semibold" onClick={handleLogin}>
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
  
  );
}
