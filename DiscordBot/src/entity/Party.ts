import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class Party {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 50})
    name: string

    @Column()
    author: string

    @Column({length: 1000})
    description: string

    @Column("date")
    date: number

    @Column()
    day: number

    @Column("time with time zone")
    time: number

}
