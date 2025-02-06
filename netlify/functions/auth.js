const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    const { email, password } = JSON.parse(event.body);

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Регистрация успешна!" }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ошибка сервера" }),
        };
    }
};
