// ============================================================
// LAST SHIFT
// Roblox API Service
// ============================================================

const ROBLOX_API = "https://users.roblox.com/v1";


// ============================================================
// REQUEST HELPER
// ============================================================

async function robloxRequest(
    url,
    options = {}
) {

    const response = await fetch(
        url,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    let data = null;

    try {

        data = await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        const error = new Error(
            `Roblox API returned ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;

    }


    return data;

}


// ============================================================
// FIND USER BY USERNAME
// ============================================================

async function getUserByUsername(
    username
) {

    if (
        !username ||
        typeof username !== "string"
    ) {

        return null;

    }


    username =
        username.trim();


    if (
        username.length < 3 ||
        username.length > 20
    ) {

        return null;

    }


    const data =
        await robloxRequest(

            `${ROBLOX_API}/usernames/users`,

            {

                method: "POST",

                body: JSON.stringify({

                    usernames: [
                        username
                    ],

                    excludeBannedUsers: false

                })

            }

        );


    if (
        !data ||
        !Array.isArray(data.data) ||
        data.data.length === 0
    ) {

        return null;

    }


    const user =
        data.data[0];


    return {

        id: String(
            user.id
        ),

        username:
            user.name,

        displayName:
            user.displayName

    };

}


// ============================================================
// GET USER BY ID
// ============================================================

async function getUserById(
    userId
) {

    if (!userId) {

        return null;

    }


    const data =
        await robloxRequest(

            `${ROBLOX_API}/users/${encodeURIComponent(
                userId
            )}`

        );


    if (!data) {

        return null;

    }


    return {

        id: String(
            data.id
        ),

        username:
            data.name,

        displayName:
            data.displayName,

        description:
            data.description || "",

        created:
            data.created,

        isBanned:
            Boolean(
                data.isBanned
            )

    };

}


// ============================================================
// CHECK VERIFICATION CODE
// ============================================================

async function checkVerificationCode(
    userId,
    code
) {

    const user =
        await getUserById(
            userId
        );


    if (!user) {

        return {

            success: false,

            reason:
                "USER_NOT_FOUND"

        };

    }


    if (
        user.isBanned
    ) {

        return {

            success: false,

            reason:
                "USER_BANNED",

            user

        };

    }


    const description =
        String(
            user.description || ""
        );


    const normalizedDescription =
        description
            .toUpperCase()
            .replace(/\s+/g, " ")
            .trim();


    const normalizedCode =
        String(
            code
        )
            .toUpperCase()
            .trim();


    if (
        !normalizedDescription.includes(
            normalizedCode
        )
    ) {

        return {

            success: false,

            reason:
                "CODE_NOT_FOUND",

            user

        };

    }


    return {

        success: true,

        user

    };

}


module.exports = {

    getUserByUsername,

    getUserById,

    checkVerificationCode

};
