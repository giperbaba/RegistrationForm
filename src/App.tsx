import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User } from '../types/User';
import { postUser } from "./shared/api/requests/profile/sign-in/post";
import { postPhone } from "./shared/api/requests/otps/post";

const App = () => {
    const { register, handleSubmit, formState: { errors }, trigger } = useForm();

    const [count, setCount] = useState(40);

    const [isTimerStart, setIsTimerStart] = useState(false);
    const [isPhoneApproved, setIsPhoneApproved] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVisibleRequestAgain, setIsVisibleRequestAgain] = useState(false);

    const [isCodeLengthInvalid, setIsCodeLengthInvalid] = useState(false);

    const handleKeyPress = (e) => {
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== ' ') {
            e.preventDefault();
        }
    };

    function requestAgain() {
        setIsVisibleRequestAgain(true);
    }

    useEffect(() => {
        let timer: number | 0;
        if (isTimerStart && count > 0) {
            timer = setInterval(() => {
                setCount(prevCount => prevCount - 1);
            }, 1000);
        }
        else if (count === 0) {
            setIsTimerStart(false);
            setCount(40);
            requestAgain();
            setIsCodeSent(false);
        }

        return () => clearInterval(timer);
    }, [isTimerStart, count]);

    const onSubmit = async (data) => {
        const isValid = await trigger('phone');

        if (!isValid) {
            return;
        }

        if (isCodeSent && (!data.code || data.code.length !== 6)) {
            setIsCodeLengthInvalid(true);
            return;
        }

        else {
            setIsCodeLengthInvalid(false);
        }

        if (!isCodeSent) {
            try {         
                const responsePhone = await postPhone(data.phone)
                setIsPhoneApproved(true)
                setIsCodeSent(true);
                setIsTimerStart(true);
            }
            catch (e) {
                setIsCodeSent(false);
                console.log(e);
            }
        }
        else {
            try {
                const responseSignIn = await postUser(data.phone, data.code)
                setIsVisibleRequestAgain(false);

                const responseData = responseSignIn.data;

                const user: User = responseData.user;
                console.log(user);
            }
            catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form">
            <h1>Вход</h1>

            {
                isPhoneApproved
                    ? <span>Введите проверочный код для входа<br />в личный кабинет</span>
                    : <span>Введите номер телефона для входа<br />в личный кабинет</span>
            }

            <input
                type="tel"
                onKeyDown={handleKeyPress}
                {...register('phone', {
                    required: 'Поле является обязательным',
                    pattern: {
                        value: /^((7|8|(\+7))\d{10})$/,
                        message: 'Поле является обязательным'
                    }
            
                })}
                className="input"
                placeholder="Телефон"
            />

            {errors.phone?.message ? <span className="errors">{errors.phone.message}</span> : null}

            {(isCodeSent || isVisibleRequestAgain) && (
                <>
                    <input
                        type="text"
                        onKeyDown={handleKeyPress}
                        {...register('code')}
                        className="input"
                        placeholder="Проверочный код"
                    />
                    {isCodeLengthInvalid && (
                        <span className="errors">Код должен содержать 6 цифр</span>
                    )}
                </>
            )}
            <button type="submit" className="button">
                {isPhoneApproved ? 'Войти' : 'Продолжить'}
            </button>

            {isTimerStart ? (<span id="timer-span">Запросить код повторно можно через {count} секунд</span>) : isVisibleRequestAgain ? (<span onClick={handleSubmit(onSubmit)} id="clickable-span">Запросить код еще раз</span>) : null}

        </form>
    );
}

export default App;
