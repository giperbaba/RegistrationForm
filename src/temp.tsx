import axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const App = () => {
    const { register, handleSubmit, formState: { errors }, trigger } = useForm();

    const [isTimerStart, setIsTimerStart] = useState(false);
    const [count, setCount] = useState(2);

    const [isPhoneSubmited, setIsPhoneSubmited] = useState(false);
    const [isVisibleRequestAgain, setIsVisibleRequestAgain] = useState(false);

    const handleKeyPress = (e) => {
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace') {
            e.preventDefault();
        }
    };

    function requestAgain () {
        setIsVisibleRequestAgain(true)
    }

    useEffect(() => {
        let timer;
        if (isTimerStart && count > 0) {
            timer = setInterval(() => {
                setCount(prevCount => prevCount - 1);
            }, 1000);
        } 

        else if (count === 0) {
            setIsTimerStart(false);
            setCount(40);
            requestAgain()
            setIsPhoneSubmited(false)
        }

        return () => clearInterval(timer);
    }, [isTimerStart, count]);


    const onSubmit = async (data) => {

        const isValid = await trigger('phone');
        if (!isValid) {
            return;
        }

        if (!isPhoneSubmited) {
            try {
                const postPhone = await axios.post('https://shift-backend.onrender.com/auth/otp', {
                    phone: data.phone,
                });
                setIsPhoneSubmited(true)
                console.log(postPhone.data)
            }
            catch (e) {
                setIsPhoneSubmited(false)
                console.log(e);
            }
        }
        else {
            try {
                console.log({
                    phone: data.phone,
                    code: Number(data.code)
                })
                const postUser = await axios.post('https://shift-backend.onrender.com/users/signin', {
                    phone: data.phone,
                    code: Number(data.code)
                });
                setIsTimerStart(true)
                setIsVisibleRequestAgain(false)
                console.log(postUser.data)
            }
            catch (e) {
                console.log(e);
            }

        }
    }


    const validateCode = (value) => {
        if (value.length !== 6) {
            return "Код должен содержать 6 цифр";
        }
        return true;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form">
            <h1>Вход</h1>
            {
                isPhoneSubmited
                    ? <span>Введите проверочный код для входа в личный кабинет</span>
                    : <span>Введите номер телефона для входа в личный кабинет</span>
            }

            <input
                type="tel"
                onKeyDown={handleKeyPress}
                {...register('phone', {
                    required: 'Поле является обязательным',
                    pattern: {
                        value: /((7|8)([0-9]){10})/,
                    }
                })}
                className="input"
                placeholder="Телефон"
            />

            {errors.phone?.message ? <span className="errors">{errors.phone.message}</span> : null}

            {(isPhoneSubmited || isVisibleRequestAgain) &&  (
                <>
                    <input
                        type="text"
                        onKeyDown={handleKeyPress}
                        {...register('code', {
                            validate: validateCode
                        })}
                        className="input"
                        placeholder="Проверочный код"
                    />
                    {errors.code?.message ? <span className="errors">{errors.code.message}</span> : null}
                </>
            )}
            <button type="submit" className="button">
                {isPhoneSubmited ? 'Войти' : 'Продолжить'}
            </button>
            {isTimerStart && (
                <>
                    <span>Запросить код повторно можно через {count} секунд</span>
                </>
            )}

            {isVisibleRequestAgain && (
                <>
                    <span onClick={handleSubmit(onSubmit)} className="clickable-span">Запросить код еще раз</span>
    
                </>
            )}
        </form>)
}

export default App;