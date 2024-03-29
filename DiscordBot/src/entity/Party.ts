import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class Party {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 45})
    name: string

    @Column({length: 45})
    author: string

    @Column({nullable: true, length: 1000})
    description: string

    @Column({nullable: true, length: 1000})
    additional_info: string

    @Column({nullable: true})
    tw: string

    @Column({nullable: true})
    beginner_friendly: boolean

    @Column({nullable: true, type: 'int'})
    level: number

    @Column({nullable: true, length: 250})
    when: string
}
