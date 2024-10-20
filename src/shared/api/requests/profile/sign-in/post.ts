import axios from "axios";

export const postUser = async (phone: string, code: number) => await axios.post('https://shift-backend.onrender.com/users/signin', {
    phone: phone.replace(/ /g, ''),
    code: Number(code)
});