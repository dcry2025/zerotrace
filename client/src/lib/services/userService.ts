// src/api/userService.ts


// import { userApi } from '$lib/api';


const userService = {



	/**
	 * Get template translations by language
	 */
	getAllTemplates: async (): Promise<any> => {
		try {
			// return await userApi.getAllTemplates();
			throw new Error('User API not implemented');
		} catch (error: any) {
			console.error('getAllTemplates error:', error);
			throw error;
		}
	},


};


export default userService;
