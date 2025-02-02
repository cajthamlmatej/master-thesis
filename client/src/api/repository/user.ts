import {Repository} from "../repository";
import type OneUserSuccessDTO from "../../../lib/dto/response/user/OneUserSuccessDTO";
import type DeleteUserDTO from "../../../lib/dto/request/user/DeleteUserDTO";

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
}
