package com.example.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

public class MediaUpdateDTO {
    private String caption;
    private Integer displayOrder;

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public MediaUpdateDTO() {
    }

    public MediaUpdateDTO(String caption, Integer displayOrder) {
        this.caption = caption;
        this.displayOrder = displayOrder;
    }
}