import axios from "axios";

export const postPhone = async (phone: string) => await axios.post('https://shift-backend.onrender.com/auth/otp', {
    phone: phone.replace(/ /g, ''),
});