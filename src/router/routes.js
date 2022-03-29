import VAutorize from "@/components/VAutorize";
import VRegistration from "@/components/VRegistration";
import VChat from "@/components/VChat";

export default [

    {
        path: '/',
        name: 'autorize',
        component: VAutorize
    },
    {
        path: '/registration',
        name: 'registration',
        component: VRegistration
    },
    {
        path: '/chat',
        name: 'chat',
        component: VChat
    },

]