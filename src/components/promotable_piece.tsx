import React from "react"
import { PieceType, Piece } from "../models/piece"
import { BoardColor } from "../utils/board_utils"
import { Grid } from "./grid";
import { PieceIcon } from "./piece_icon";

const PAWN_PROMOTION_PIECE_TYPES = ['queen', 'knight', 'rook', 'bishop'] as PieceType[];

type PromotablePawnOptionsProps = {
    color: BoardColor
    promotePawn: (type: PieceType) => void;
}
export const PromotablePawnOptions: React.FC<PromotablePawnOptionsProps> = ({ color, promotePawn }) => {
    return (
        <Grid container>
            {PAWN_PROMOTION_PIECE_TYPES.map(type => (
                <Grid size={6}>
                    <PieceIcon
                        piece={Piece.create(type, color)}
                        stopClickEventPropagation={true}
                        onClick={() => promotePawn(type)}
                    />
                </Grid>
            ))}
        </Grid>
    )
}