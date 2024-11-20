// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import './Widget.css';
import bridge from "@vkontakte/vk-bridge";

export const Widget = () => {
    const [hotel, setHotel] = useState('');
    const [isWidgetVisible, setWidgetVisible] = useState(false);
    const [groupId, setGroupId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const group_id = params.get('vk_group_id');

        if (group_id) {
            setGroupId(group_id);
            fetch(``)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Ошибка сети: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.hash) {
                        setHotel(data.hash);
                        setWidgetVisible(true);
                    }
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Ошибка при получении хеша с сервера:', error);
                    setIsLoading(false);
                });
        } else {
            bridge.send('VKWebAppAddToCommunity')
                .then((data) => {
                    if (data.group_id) {
                        console.log('Мини-приложение установлено в сообщество:', data.group_id);
                        setGroupId(data.group_id);
                    }
                })
                .catch((error) => {
                    console.log('Ошибка при добавлении мини-приложения:', error);
                });
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isWidgetVisible && hotel) {
            (function(w) {
                let q = {
                    'container': 'adg-booking-widget',
                    'hotel': hotel,
                    'lang': 'ru',
                    'headerHeight': 0,
                    'footerHeight': 0,
                    'type': '2',
                    'css': '',
                    'country': 'ru',
                    'yaMetrika': '',
                };
                w.artDg = (w.artDg || { 'loader': false });
                w.artDg['config'] = q;
                if (!w.artDg['loader']) {
                    w.artDg['loader'] = true;
                    let d = w.document,
                        s = d.createElement('script');
                    s.type = 'text/javascript';
                    s.async = true;
                    s.src = '';
                    (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s);
                }
            })(window);

            return () => {
                const existingScript = document.querySelector('script[src="https://api.uhotels.app/widget/booking2/loader.js?29"]');
                if (existingScript) {
                    existingScript.remove();
                }
                delete window.artDg;
            };
        }
    }, [isWidgetVisible, hotel]);

    const handleInputChange = (event) => {
        setHotel(event.target.value);
    };

    const handleButtonClick = () => {
        if (hotel && groupId) {
            const url = `https://account.uhotels.app/api/get-hash?vk_group_id=${groupId}&hash=${hotel}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
                    }
                    return response.json();
                })
                .then((responseData) => {
                    console.log('Ответ от сервера:', responseData);
                    setWidgetVisible(true);
                })
                .catch((error) => {
                    alert(`Произошла ошибка: ${error.message}`);
                });
        } else {
            alert("Пожалуйста, введите hash и убедитесь, что сообщества определен.");
        }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="widget-container">
            {error && <div className="error-message">{error}</div>}

            {!isWidgetVisible ? (
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Введите hash"
                        value={hotel}
                        onChange={handleInputChange}
                        className="hash-input"
                    />
                    <button onClick={handleButtonClick} className="open-widget-button">Открыть</button>
                </div>
            ) : (
                <div id="adg-booking-widget" style={{ width: '100%', height: '100%' }}></div>
            )}
        </div>
    );
};