import {Entity, Column, PrimaryColumn} from "typeorm"

@Entity()
export class User {

    @PrimaryColumn()
    user_id: string

    @PrimaryColumn()
    party_id: number

    @Column()
    status: string

}
