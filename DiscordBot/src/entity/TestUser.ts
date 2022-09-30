import {Entity, Column, PrimaryColumn} from "typeorm"

@Entity()
export class TestUser {

    @PrimaryColumn()
    user_id: string

    @PrimaryColumn()
    party_id: number

    @Column()
    status: string

}
