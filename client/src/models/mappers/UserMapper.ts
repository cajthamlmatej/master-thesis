import User from "@/models/User";
import type UserDTO from "../../../lib/dto/response/user/UserDTO";

export default class UserMapper {

    public static fromUserDTO(dto: UserDTO) {
        return new User(dto.id, dto.name, dto.email, dto.active);
    }

}
