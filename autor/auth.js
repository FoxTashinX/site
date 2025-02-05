const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
    const { action, email, password } = JSON.parse(event.body);

    if (action === "register") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Регистрация успешна, проверьте почту!" }),
        };
    }

    if (action === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Успешный вход!" }),
        };
    }

    if (action === "logout") {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Вы вышли из системы!" }),
        };
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ error: "Неизвестное действие" }),
    };
};
