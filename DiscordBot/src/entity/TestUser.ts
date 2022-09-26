import {Entity, Column, PrimaryColumn} from "typeorm"

@Entity()
export class TestUser {

    @PrimaryColumn()
    user_id: number

    @PrimaryColumn()
    party_id: string

    @Column()
    status: string

}
