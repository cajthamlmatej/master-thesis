import User from "@/models/User";
import UserDTO from "../../../lib/dto/user/UserDTO";

export default class UserMapper {

    public static fromUserDTO(dto: UserDTO) {
        return new User(dto.id, dto.name, dto.email, dto.active);
    }

}
