import {Repository} from "../repository";
import OneUserSuccessDTO from "../../../lib/dto/user/OneUserSuccessDTO";
import UpdateUserDTO from "../../../lib/dto/user/UpdateUserDTO";

export class UserRepository extends Repository {
    /**
     * Get the current user.
     */
    public async get(user: string) {
        return await this.makeRequest<OneUserSuccessDTO>(
            `user/${user}`,
            "GET"
        );
    }

    //
    // async delete(user: string, data?: DeleteUserDTO) {
    //     return await this.makeRequest(
    //         `user/${user}`,
    //         "DELETE",
    //         data
    //     );
    // }
    //
    // async changePassword(user: string, newPassword: string) {
    //     return await this.makeRequest(
    //         `user/${user}`,
    //         "PATCH",
    //         {password: newPassword}
    //     );
    // }
    async update(id: string, data: UpdateUserDTO) {
        return await this.makeRequest(
            `user/${id}`,
            "PATCH",
            data
        );
    }
}
